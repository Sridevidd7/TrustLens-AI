import json
from db import get_db, init_db, insert_default_settings


def seed_database():
    init_db()
    insert_default_settings()

    conn = get_db()
    cur = conn.cursor()
    cur.execute("SELECT COUNT(*) FROM recommendations")
    if cur.fetchone()[0] > 0:
        conn.close()
        return

    recommendations = [
        {
            "title": "Enforce MFA for privileged accounts",
            "summary": "Require multi-factor authentication for high-risk administrator accounts to reduce credential abuse.",
            "severity": "High",
            "confidence_score": 94,
            "confidence_label": "High confidence",
            "confidence_reason": "The AI is confident because recent sign-in anomalies, privileged role usage, and policy exceptions align.",
            "status": "Pending",
            "affected_count": 18,
            "category": "Identity Security",
            "reasoning_steps": json.dumps([
                "Privileged accounts show unusual login patterns across multiple geographies.",
                "Current MFA coverage is below the target threshold for this user group.",
                "The recommendation reduces the chance of credential theft and lateral movement.",
                "The action is reversible and can be phased in by role segment."
            ]),
            "evidence": json.dumps([
                "3 recent password reset anomalies",
                "12 admin sessions from untrusted networks",
                "Policy gap for 18 privileged accounts"
            ]),
            "data_sources": json.dumps([
                "Identity provider logs",
                "Endpoint threat telemetry",
                "Security policy baseline"
            ]),
            "limitations": json.dumps([
                "User onboarding friction may temporarily increase.",
                "Some legacy applications may not support MFA prompts.",
                "The AI may be wrong because some login anomalies could be from approved travel."
            ]),
            "alternatives": json.dumps([
                "Require temporary access approval for high-risk sessions",
                "Limit admin permissions until MFA enrollment completes",
                "Use phishing-resistant hardware tokens for critical admins"
            ]),
            "agent_flow": json.dumps([
                "Log ingestion",
                "Anomaly correlation",
                "Policy evaluation",
                "Human approval checkpoint"
            ]),
            "approve_impact": "Privileged accounts will be required to use MFA before the next session.",
            "reject_impact": "Risk remains for credential-based attacks on admin accounts.",
            "business_impact": "Moderate operational friction but protects executive and admin workflows.",
            "security_impact": "High reduction in account compromise risk.",
            "disruption_level": "Medium",
            "recommended_path": "Apply MFA on the highest-risk roles first, then monitor enrollment completion."
        },
        {
            "title": "Patch critical Windows vulnerability",
            "summary": "Deploy an urgent operating system patch to reduce exposure from a known remote exploit.",
            "severity": "Critical",
            "confidence_score": 89,
            "confidence_label": "High confidence",
            "confidence_reason": "The AI is confident because the vulnerability is actively being exploited and many affected hosts are unpatched.",
            "status": "Pending",
            "affected_count": 246,
            "category": "Patch Management",
            "reasoning_steps": json.dumps([
                "A public exploit has been observed targeting this CVE.",
                "The affected fleet includes older Windows builds that are not yet updated.",
                "Delay increases the chance of ransomware activity.",
                "The patch is available and validated for staging."
            ]),
            "evidence": json.dumps([
                "CVE exploit telemetry from threat intel feeds",
                "246 unmanaged endpoints still on vulnerable version",
                "Patch success rate above 98% in pilot environments"
            ]),
            "data_sources": json.dumps([
                "Vulnerability scanner",
                "Endpoint patch compliance data",
                "Threat intelligence feed"
            ]),
            "limitations": json.dumps([
                "Some devices may require maintenance windows.",
                "The AI may be wrong because a few endpoints have custom drivers that could block deployment.",
                "Patch timing may affect business-critical services."
            ]),
            "alternatives": json.dumps([
                "Isolate affected devices from the network temporarily",
                "Apply compensating controls while waiting for testing",
                "Schedule deployment in smaller maintenance batches"
            ]),
            "agent_flow": json.dumps([
                "Threat feed scan",
                "Host inventory check",
                "Risk scoring",
                "Approval and rollout"
            ]),
            "approve_impact": "Patch deployment will begin immediately for the affected fleet.",
            "reject_impact": "Affected endpoints remain exposed to active exploitation.",
            "business_impact": "High if rollout is delayed, but controlled deployment reduces disruption.",
            "security_impact": "Critical reduction in exploitability.",
            "disruption_level": "High",
            "recommended_path": "Run the patch in a phased rollout with maintenance windows and rollback prepared."
        },
        {
            "title": "Remove stale guest access",
            "summary": "Revoke guest accounts that have not been used for a long time to reduce attack surface.",
            "severity": "Medium",
            "confidence_score": 76,
            "confidence_label": "Review recommended",
            "confidence_reason": "The AI is confident because dormant guest accounts have little recent activity and may be abandoned.",
            "status": "Pending",
            "affected_count": 42,
            "category": "Access Control",
            "reasoning_steps": json.dumps([
                "42 guest accounts have had no activity for more than 90 days.",
                "Several of these accounts are tied to expired vendor contracts.",
                "The review reduces unnecessary access exposure.",
                "A staged removal can preserve business continuity."
            ]),
            "evidence": json.dumps([
                "Guest account usage logs",
                "Contract renewal status",
                "Inactive user report"
            ]),
            "data_sources": json.dumps([
                "Identity directory",
                "Vendor onboarding records",
                "Audit log history"
            ]),
            "limitations": json.dumps([
                "Some guests may still be needed during active projects.",
                "The AI may be wrong because some accounts are used outside normal business hours.",
                "A few records may be missing contract metadata."
            ]),
            "alternatives": json.dumps([
                "Convert selected guests to temporary contractor accounts",
                "Keep access but lower privileges for a short period",
                "Require business owner approval before removal"
            ]),
            "agent_flow": json.dumps([
                "Access review",
                "Usage analysis",
                "Owner validation",
                "Cleanup approval"
            ]),
            "approve_impact": "Inactive guest accounts will be removed and ticketed for audit.",
            "reject_impact": "Unneeded access remains available and increases exposure.",
            "business_impact": "Low to moderate, mostly administrative cleanup.",
            "security_impact": "Moderate improvement in access hygiene.",
            "disruption_level": "Low",
            "recommended_path": "Review with owners and remove accounts in batches over the next week."
        },
        {
            "title": "Retire inactive device records",
            "summary": "Archive stale endpoint records that no longer match the current device inventory.",
            "severity": "Low",
            "confidence_score": 68,
            "confidence_label": "Review recommended",
            "status": "Pending",
            "affected_count": 137,
            "category": "Device Hygiene",
            "confidence_reason": "The AI is confident because records are duplicated and show no recent heartbeat activity.",
            "reasoning_steps": json.dumps([
                "137 devices appear inactive for over six months.",
                "Many records are duplicates of active machines.",
                "Removing stale records improves asset visibility.",
                "The action is low risk and mostly cleanup focused."
            ]),
            "evidence": json.dumps([
                "Asset inventory comparison",
                "Heartbeat data gaps",
                "Duplicate certificate records"
            ]),
            "data_sources": json.dumps([
                "CMDB records",
                "Asset inventory",
                "Device compliance data"
            ]),
            "limitations": json.dumps([
                "Some inactive records could be archived for legal retention reasons.",
                "The AI may be wrong because some devices are offline for long maintenance periods.",
                "Inventory ownership may be incomplete."
            ]),
            "alternatives": json.dumps([
                "Keep records in a read-only archive for another quarter",
                "Verify ownership before deleting any device entries",
                "Merge duplicate records instead of removing them"
            ]),
            "agent_flow": json.dumps([
                "Inventory reconciliation",
                "Duplicate detection",
                "Ownership check",
                "Archive or delete"
            ]),
            "approve_impact": "Stale records will be archived and removed from the active inventory.",
            "reject_impact": "Asset visibility will remain noisy and less reliable.",
            "business_impact": "Low impact with improved reporting quality.",
            "security_impact": "Low improvement in operational hygiene.",
            "disruption_level": "Low",
            "recommended_path": "Archive first and remove only if no ownership disputes remain."
        },
        {
            "title": "Quarantine suspicious endpoint",
            "summary": "Isolate a potentially compromised endpoint until it can be reviewed by the security team.",
            "severity": "Critical",
            "confidence_score": 61,
            "confidence_label": "Low confidence",
            "status": "Pending",
            "affected_count": 1,
            "category": "Endpoint Security",
            "confidence_reason": "The AI is confident because the endpoint shows unusual process behavior, but the evidence is not yet complete.",
            "reasoning_steps": json.dumps([
                "The endpoint shows new persistence activity and unusual outbound network chatter.",
                "No confirmed malware sample has been captured yet.",
                "Quarantine is a strong safeguard that limits spread.",
                "The action should be reviewed carefully due to user impact."
            ]),
            "evidence": json.dumps([
                "Suspicious scheduled task creation",
                "Unexpected outbound connections",
                "User-reported slowed device performance"
            ]),
            "data_sources": json.dumps([
                "EDR alerts",
                "Network proxy logs",
                "User incident report"
            ]),
            "limitations": json.dumps([
                "The AI may be wrong because some telemetry could be from a legitimate admin script.",
                "The endpoint might be needed for business-critical work.",
                "A false positive could disrupt the user temporarily."
            ]),
            "alternatives": json.dumps([
                "Monitor the endpoint in a restricted network segment",
                "Disable specific processes instead of full quarantine",
                "Escalate to the SOC for manual investigation"
            ]),
            "agent_flow": json.dumps([
                "Alert triage",
                "Process inspection",
                "Containment decision",
                "Escalation checkpoint"
            ]),
            "approve_impact": "The device will be isolated from the network until reviewed.",
            "reject_impact": "The suspected threat may continue spreading across the environment.",
            "business_impact": "High user disruption if the device is critical to operations.",
            "security_impact": "High containment value but requires careful validation.",
            "disruption_level": "High",
            "recommended_path": "Escalate to the on-call analyst before taking final containment action."
        }
    ]

    cur.executemany(
        """
        INSERT INTO recommendations (
            title, summary, severity, confidence_score, confidence_label, confidence_reason,
            status, affected_count, category, reasoning_steps, evidence, data_sources,
            limitations, alternatives, agent_flow, approve_impact, reject_impact,
            business_impact, security_impact, disruption_level, recommended_path
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """,
        [
            (
                item["title"], item["summary"], item["severity"], item["confidence_score"], item["confidence_label"], item["confidence_reason"],
                item["status"], item["affected_count"], item["category"], item["reasoning_steps"], item["evidence"], item["data_sources"],
                item["limitations"], item["alternatives"], item["agent_flow"], item["approve_impact"], item["reject_impact"],
                item["business_impact"], item["security_impact"], item["disruption_level"], item["recommended_path"]
            )
            for item in recommendations
        ]
    )

    incidents = [
        {
            "title": "Guest access lease expired unexpectedly",
            "happened": "A vendor account remained active after the contract ended, exposing shared storage folders.",
            "why": "The renewal workflow failed to notify the access owner, and the guest account was not reviewed before expiry.",
            "safeguard": "The access review dashboard flagged the stale account and the team removed it before further spread.",
            "human_decision": "Security ops extended access for one day while the vendor team revalidated the contract.",
            "prevention": "Automate renewal reminders and require owner confirmation for every temporary vendor account.",
            "severity": "Medium"
        }
    ]

    cur.executemany(
        "INSERT INTO incidents (title, happened, why, safeguard, human_decision, prevention, severity) VALUES (?, ?, ?, ?, ?, ?, ?)",
        [(item["title"], item["happened"], item["why"], item["safeguard"], item["human_decision"], item["prevention"], item["severity"]) for item in incidents]
    )

    usability = [
        {
            "participant": "Participant A",
            "comprehension_score": 94,
            "time_to_decision": "1m 42s",
            "confusion_points": "Wanted clearer impact labels on the severity panel.",
            "design_improvements": "Added stronger explanation callouts and clearer decision summaries."
        },
        {
            "participant": "Participant B",
            "comprehension_score": 91,
            "time_to_decision": "1m 18s",
            "confusion_points": "Needed a faster path to view alternatives.",
            "design_improvements": "Introduced one-click alternative previews and better visual grouping."
        },
        {
            "participant": "Participant C",
            "comprehension_score": 89,
            "time_to_decision": "1m 56s",
            "confusion_points": "Wanted clearer audit wording for approved actions.",
            "design_improvements": "Updated audit language to plain English and stronger timeline markers."
        },
        {
            "participant": "Participant D",
            "comprehension_score": 96,
            "time_to_decision": "1m 09s",
            "confusion_points": "A few labels were too technical for first-time users.",
            "design_improvements": "Replaced technical terms with clearer business-friendly explanations."
        },
        {
            "participant": "Participant E",
            "comprehension_score": 93,
            "time_to_decision": "1m 27s",
            "confusion_points": "Wanted a confirmation summary before high-impact actions.",
            "design_improvements": "Added confirmed decision modal flows for critical recommendations."
        }
    ]

    cur.executemany(
        "INSERT INTO usability_results (participant, comprehension_score, time_to_decision, confusion_points, design_improvements) VALUES (?, ?, ?, ?, ?)",
        [(item["participant"], item["comprehension_score"], item["time_to_decision"], item["confusion_points"], item["design_improvements"]) for item in usability]
    )

    conn.commit()
    conn.close()


if __name__ == "__main__":
    seed_database()
    print("Database seeded successfully.")
