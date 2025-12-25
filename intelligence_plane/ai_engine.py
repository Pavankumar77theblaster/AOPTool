"""
AOPTool Intelligence Plane - AI Reasoning Engine
Translates natural language to attack plans using Claude/OpenAI
"""

import os
import json
from typing import List, Dict, Optional, Any
from datetime import datetime
import asyncio

# AI Clients
try:
    import anthropic
    CLAUDE_AVAILABLE = True
except ImportError:
    CLAUDE_AVAILABLE = False

try:
    import openai
    OPENAI_AVAILABLE = True
except ImportError:
    OPENAI_AVAILABLE = False


class AIEngine:
    """AI-powered attack planning and translation engine"""

    def __init__(self):
        self.claude_api_key = os.getenv('CLAUDE_API_KEY')
        self.openai_api_key = os.getenv('OPENAI_API_KEY')
        self.use_ai = os.getenv('ENABLE_AI_TRANSLATION', 'true').lower() == 'true'

        # Initialize AI clients
        self.claude_client = None
        self.openai_client = None

        if self.use_ai:
            if self.claude_api_key and CLAUDE_AVAILABLE:
                self.claude_client = anthropic.Anthropic(api_key=self.claude_api_key)
                print("✓ Claude AI client initialized")

            if self.openai_api_key and OPENAI_AVAILABLE:
                self.openai_client = openai.OpenAI(api_key=self.openai_api_key)
                print("✓ OpenAI client initialized")

        if not self.claude_client and not self.openai_client:
            print("⚠ No AI clients available - using rule-based translation")

    async def translate_natural_language_to_attacks(
        self,
        description: str,
        target_type: str,
        available_attacks: List[Dict[str, Any]],
        risk_level: str = "medium"
    ) -> Dict[str, Any]:
        """
        Translate natural language attack description to executable attack sequence

        Args:
            description: Natural language description of attack goal
            target_type: Type of target (web_app, api, network, etc.)
            available_attacks: List of available attack techniques
            risk_level: Maximum risk level allowed (low, medium, high)

        Returns:
            dict: Attack plan with sequence, reasoning, and metadata
        """

        # Build attack library context
        attack_context = self._build_attack_context(available_attacks, target_type)

        # Try AI translation first
        if self.claude_client:
            result = await self._translate_with_claude(
                description, target_type, attack_context, risk_level
            )
            if result:
                return result

        if self.openai_client:
            result = await self._translate_with_openai(
                description, target_type, attack_context, risk_level
            )
            if result:
                return result

        # Fallback to rule-based translation
        return self._translate_with_rules(
            description, target_type, available_attacks, risk_level
        )

    def _build_attack_context(self, attacks: List[Dict], target_type: str) -> str:
        """Build context string of available attacks"""
        context_lines = ["Available attack techniques:"]

        for attack in attacks:
            if attack.get('target_type') == target_type or attack.get('target_type') == 'any':
                context_lines.append(
                    f"- ID {attack['id']}: {attack['name']} "
                    f"(Risk: {attack.get('risk_level', 'unknown')}, "
                    f"Category: {attack.get('category', 'unknown')})"
                )

        return "\n".join(context_lines)

    async def _translate_with_claude(
        self, description: str, target_type: str,
        attack_context: str, risk_level: str
    ) -> Optional[Dict]:
        """Translate using Claude AI"""

        system_prompt = """You are an expert penetration testing AI assistant. Your job is to translate
natural language attack descriptions into concrete attack sequences using available tools.

You must respond with ONLY valid JSON in this exact format:
{
    "attack_sequence": [1, 2, 3],
    "reasoning": "explanation of why these attacks in this order",
    "estimated_duration_minutes": 30,
    "prerequisites": ["prerequisite 1", "prerequisite 2"],
    "expected_outcomes": ["outcome 1", "outcome 2"],
    "risk_assessment": "low|medium|high"
}

Important:
- Only include attack IDs that exist in the available attacks list
- Order attacks logically (reconnaissance -> exploitation -> post-exploitation)
- Respect the maximum risk level constraint
- Be conservative and ethical - this is for authorized testing only
"""

        user_prompt = f"""Target Type: {target_type}
Maximum Risk Level: {risk_level}
Attack Goal: {description}

{attack_context}

Create an attack plan that achieves this goal using only the available attacks listed above.
Respond with JSON only, no other text."""

        try:
            message = self.claude_client.messages.create(
                model="claude-3-5-sonnet-20241022",
                max_tokens=2000,
                system=system_prompt,
                messages=[
                    {"role": "user", "content": user_prompt}
                ]
            )

            response_text = message.content[0].text.strip()

            # Parse JSON response
            result = json.loads(response_text)
            result['ai_model'] = 'claude-3-5-sonnet'
            result['translation_method'] = 'ai'

            return result

        except Exception as e:
            print(f"Claude translation failed: {e}")
            return None

    async def _translate_with_openai(
        self, description: str, target_type: str,
        attack_context: str, risk_level: str
    ) -> Optional[Dict]:
        """Translate using OpenAI"""

        system_prompt = """You are an expert penetration testing AI assistant. Translate
natural language attack descriptions into attack sequences. Respond with ONLY valid JSON:
{
    "attack_sequence": [1, 2, 3],
    "reasoning": "explanation",
    "estimated_duration_minutes": 30,
    "prerequisites": [],
    "expected_outcomes": [],
    "risk_assessment": "low|medium|high"
}"""

        user_prompt = f"""Target: {target_type}
Max Risk: {risk_level}
Goal: {description}

{attack_context}

Create attack plan using available attacks. JSON only."""

        try:
            response = self.openai_client.chat.completions.create(
                model="gpt-4",
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt}
                ],
                response_format={"type": "json_object"},
                temperature=0.3
            )

            result = json.loads(response.choices[0].message.content)
            result['ai_model'] = 'gpt-4'
            result['translation_method'] = 'ai'

            return result

        except Exception as e:
            print(f"OpenAI translation failed: {e}")
            return None

    def _translate_with_rules(
        self, description: str, target_type: str,
        attacks: List[Dict], risk_level: str
    ) -> Dict:
        """Rule-based translation fallback"""

        description_lower = description.lower()
        sequence = []

        # Risk level mapping
        risk_values = {'low': 1, 'medium': 2, 'high': 3}
        max_risk = risk_values.get(risk_level, 2)

        # Filter attacks by risk and target type
        suitable_attacks = [
            a for a in attacks
            if risk_values.get(a.get('risk_level', 'medium'), 2) <= max_risk
            and (a.get('target_type') == target_type or a.get('target_type') == 'any')
        ]

        # Rule-based matching
        keywords = {
            'reconnaissance': ['recon', 'scan', 'discover', 'enumerate', 'fingerprint'],
            'vulnerability_scanning': ['vuln', 'vulnerability', 'weakness', 'cve'],
            'exploitation': ['exploit', 'attack', 'compromise', 'breach'],
            'brute_force': ['brute', 'password', 'credential', 'login'],
            'injection': ['sql', 'xss', 'inject', 'command'],
            'privilege_escalation': ['privilege', 'escalate', 'root', 'admin'],
            'data_exfiltration': ['data', 'exfil', 'steal', 'extract']
        }

        # Match keywords to attack categories
        matched_categories = []
        for category, words in keywords.items():
            if any(word in description_lower for word in words):
                matched_categories.append(category)

        # If no specific match, use standard recon -> exploit flow
        if not matched_categories:
            matched_categories = ['reconnaissance', 'vulnerability_scanning']

        # Find attacks matching categories
        for category in matched_categories:
            for attack in suitable_attacks:
                if attack.get('category') == category and attack['id'] not in sequence:
                    sequence.append(attack['id'])

        # If still no attacks, just use the first suitable one
        if not sequence and suitable_attacks:
            sequence.append(suitable_attacks[0]['id'])

        return {
            'attack_sequence': sequence,
            'reasoning': f"Rule-based translation matched categories: {', '.join(matched_categories)}",
            'estimated_duration_minutes': len(sequence) * 15,
            'prerequisites': ['Valid target in scope whitelist'],
            'expected_outcomes': ['Attack execution results'],
            'risk_assessment': risk_level,
            'ai_model': 'rule_based',
            'translation_method': 'rules'
        }

    async def analyze_attack_results(
        self,
        attack_id: int,
        target_info: Dict,
        execution_results: Dict
    ) -> Dict[str, Any]:
        """
        Analyze attack results and provide insights

        Args:
            attack_id: ID of executed attack
            target_info: Information about target
            execution_results: Results from attack execution

        Returns:
            dict: Analysis with findings, severity, recommendations
        """

        # Extract key information
        success = execution_results.get('success', False)
        output = execution_results.get('output', '')

        # AI-powered analysis if available
        if self.claude_client:
            try:
                analysis = await self._analyze_with_claude(
                    attack_id, target_info, execution_results
                )
                return analysis
            except Exception as e:
                print(f"AI analysis failed: {e}")

        # Fallback: Simple rule-based analysis
        return {
            'success': success,
            'severity': 'medium' if success else 'info',
            'findings': [output[:500]] if output else [],
            'recommendations': ['Review attack output for vulnerabilities'],
            'analysis_method': 'rule_based'
        }

    async def _analyze_with_claude(
        self, attack_id: int, target_info: Dict, results: Dict
    ) -> Dict:
        """Analyze results using Claude AI"""

        prompt = f"""Analyze these penetration testing results:

Attack ID: {attack_id}
Target: {target_info.get('name', 'Unknown')}
Success: {results.get('success', False)}
Output: {results.get('output', 'No output')[:1000]}

Provide analysis in JSON format:
{{
    "severity": "critical|high|medium|low|info",
    "findings": ["finding 1", "finding 2"],
    "vulnerabilities": ["vuln 1", "vuln 2"],
    "recommendations": ["rec 1", "rec 2"],
    "summary": "brief summary"
}}"""

        message = self.claude_client.messages.create(
            model="claude-3-5-sonnet-20241022",
            max_tokens=1500,
            messages=[{"role": "user", "content": prompt}]
        )

        response = json.loads(message.content[0].text)
        response['analysis_method'] = 'ai'
        response['success'] = results.get('success', False)

        return response
