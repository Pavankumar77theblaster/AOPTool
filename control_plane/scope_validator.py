"""
AOPTool Control Plane - Scope Validation
Critical security control to prevent unauthorized attacks
"""

import ipaddress
from typing import List, Tuple
from urllib.parse import urlparse
from loguru import logger

from database import db

class ScopeValidator:
    """
    Validates targets against whitelist

    This is a CRITICAL SECURITY CONTROL that prevents
    attacks against unauthorized systems.
    """

    def __init__(self):
        self.cidr_whitelist: List[ipaddress.IPv4Network] = []
        self.domain_whitelist: set = set()
        self.ip_whitelist: set = set()
        self.loaded = False

    async def load_whitelist(self):
        """Load whitelist from database"""
        try:
            entries = await db.fetch("SELECT entry_type, value FROM scope_whitelist")

            self.cidr_whitelist = []
            self.domain_whitelist = set()
            self.ip_whitelist = set()

            for entry in entries:
                entry_type = entry['entry_type']
                value = entry['value']

                if entry_type == 'cidr':
                    try:
                        network = ipaddress.ip_network(value)
                        self.cidr_whitelist.append(network)
                    except ValueError as e:
                        logger.warning(f"Invalid CIDR in whitelist: {value} - {e}")

                elif entry_type == 'domain':
                    self.domain_whitelist.add(value.lower())

                elif entry_type == 'ip':
                    self.ip_whitelist.add(value)

            self.loaded = True

            logger.info(
                f"Loaded whitelist: {len(self.cidr_whitelist)} CIDRs, "
                f"{len(self.domain_whitelist)} domains, "
                f"{len(self.ip_whitelist)} IPs"
            )

        except Exception as e:
            logger.error(f"Failed to load whitelist: {e}")
            raise

    def validate_ip(self, ip_str: str) -> Tuple[bool, str]:
        """
        Validate IP address against whitelist

        Args:
            ip_str: IP address string

        Returns:
            Tuple of (is_valid, reason)
        """
        try:
            ip = ipaddress.ip_address(ip_str)

            # Check exact IP match
            if str(ip) in self.ip_whitelist:
                return True, f"Exact IP match in whitelist"

            # Check CIDR ranges
            for network in self.cidr_whitelist:
                if ip in network:
                    return True, f"IP in whitelisted CIDR range {network}"

            return False, "IP not in whitelist"

        except ValueError:
            return False, f"Invalid IP address format: {ip_str}"

    def validate_domain(self, domain: str) -> Tuple[bool, str]:
        """
        Validate domain against whitelist

        Args:
            domain: Domain name

        Returns:
            Tuple of (is_valid, reason)
        """
        domain = domain.lower()

        # Check exact match
        if domain in self.domain_whitelist:
            return True, "Exact domain match in whitelist"

        # Check parent domains
        parts = domain.split('.')
        for i in range(len(parts)):
            parent = '.'.join(parts[i:])
            if parent in self.domain_whitelist:
                return True, f"Subdomain of whitelisted domain {parent}"

        return False, "Domain not in whitelist"

    def validate_url(self, url: str) -> Tuple[bool, str]:
        """
        Validate URL against whitelist

        Args:
            url: Full URL

        Returns:
            Tuple of (is_valid, reason)
        """
        try:
            parsed = urlparse(url)
            host = parsed.netloc or parsed.path

            # Remove port if present
            host = host.split(':')[0]

            if not host:
                return False, "Could not extract host from URL"

            # Try as domain first
            is_valid, reason = self.validate_domain(host)
            if is_valid:
                return True, reason

            # Try as IP
            try:
                ipaddress.ip_address(host)
                return self.validate_ip(host)
            except ValueError:
                pass

            return False, f"Host {host} not in whitelist"

        except Exception as e:
            return False, f"Error parsing URL: {e}"

    async def validate_target(self, target: str) -> Tuple[bool, str]:
        """
        Validate target (auto-detect type)

        Args:
            target: Target (IP, domain, or URL)

        Returns:
            Tuple of (is_valid, reason)
        """
        # Reload whitelist if not loaded
        if not self.loaded:
            await self.load_whitelist()

        # Try as IP first
        try:
            ipaddress.ip_address(target)
            return self.validate_ip(target)
        except ValueError:
            pass

        # Try as URL
        if '://' in target or target.startswith('www.'):
            return self.validate_url(target)

        # Try as domain
        return self.validate_domain(target)

    async def add_to_whitelist(self, entry_type: str, value: str, added_by: str, description: str = None) -> int:
        """
        Add entry to whitelist

        Args:
            entry_type: Type (cidr, domain, ip)
            value: Value to whitelist
            added_by: Username adding entry
            description: Optional description

        Returns:
            whitelist_id of created entry

        Raises:
            ValueError: If entry is invalid
        """
        # Validate entry before adding
        if entry_type == 'cidr':
            try:
                ipaddress.ip_network(value)
            except ValueError as e:
                raise ValueError(f"Invalid CIDR: {e}")

        elif entry_type == 'ip':
            try:
                ipaddress.ip_address(value)
            except ValueError as e:
                raise ValueError(f"Invalid IP: {e}")

        elif entry_type == 'domain':
            # Basic domain validation
            if not value or '/' in value or ' ' in value:
                raise ValueError("Invalid domain format")

        else:
            raise ValueError(f"Invalid entry_type: {entry_type}")

        # Insert into database
        whitelist_id = await db.fetchval(
            """
            INSERT INTO scope_whitelist (entry_type, value, description, added_by)
            VALUES ($1, $2, $3, $4)
            ON CONFLICT DO NOTHING
            RETURNING whitelist_id
            """,
            entry_type, value, description, added_by
        )

        if whitelist_id:
            # Reload whitelist
            await self.load_whitelist()
            logger.info(f"Added to whitelist: {entry_type}={value} by {added_by}")
        else:
            logger.info(f"Entry already exists in whitelist: {entry_type}={value}")

        return whitelist_id

# Global scope validator instance
scope_validator = ScopeValidator()
