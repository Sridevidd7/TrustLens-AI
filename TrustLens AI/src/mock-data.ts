export type ConfidenceLevel = 'high' | 'review' | 'low';
export type Priority = 'Critical' | 'High' | 'Medium' | 'Low';
export type ReasoningType = 'telemetry' | 'comparison' | 'history';
export type Category = 'Endpoints' | 'Network' | 'Identity' | 'Devices';

export interface ReasoningStep {
  type: ReasoningType;
  text: string;
  verificationMethod: string;
}

export interface Alternative {
  action: string;
  rejectionReason: string;
}

export interface PipelineStep {
  label: string;
  status: 'complete' | 'active' | 'pending';
}

export interface ConfidenceBreakdown {
  dataQuality: number;
  consensus: number;
  policyMatch: number;
}

export interface Recommendation {
  id: string;
  deviceId: string;
  title: string;
  description: string;
  priority: Priority;
  category: Category;
  riskLevel: string;
  resourceCount: number;
  agentsInvolved: string[];
  confidenceLevel: ConfidenceLevel;
  confidencePercent: number;
  confidenceBreakdown: ConfidenceBreakdown;
  reasoningSteps: ReasoningStep[];
  expectedImpact: string;
  confidenceExplanation: string;
  dataSources: string[];
  limitations: string;
  alternatives: Alternative[];
  pipelineSteps: PipelineStep[];
  timestamp: string;
  awaitingApproval: boolean;
}


const defaultPipeline: PipelineStep[] = [
  { label: 'Telemetry received', status: 'complete' },
  { label: 'Threat detected', status: 'complete' },
  { label: 'Policy validation', status: 'complete' },
  { label: 'Risk assessment', status: 'complete' },
  { label: 'Recommendation generated', status: 'complete' },
];

export const recommendations: Recommendation[] = [
  {
    id: 'rec-001',
    deviceId: 'WS-4421',
    title: 'Apply critical security patch KB5034441',
    description: 'A critical CVE with CVSS 8.8 is actively exploited in the wild. Immediate patching is required to close the exposure window on this device.',
    priority: 'Critical',
    category: 'Endpoints',
    riskLevel: 'Critical',
    resourceCount: 1,
    agentsInvolved: ['Risk Assessor', 'Policy Validator', 'Endpoint Scanner'],
    confidenceLevel: 'high',
    confidencePercent: 94,
    confidenceBreakdown: { dataQuality: 97, consensus: 95, policyMatch: 100 },
    reasoningSteps: [
      { type: 'telemetry', text: 'Device is running Windows 11 22H2 — patch targets this exact build.', verificationMethod: 'Verified against current tenant data · Direct observation' },
      { type: 'history', text: 'Patch was successfully applied to 312 similar devices in the last 7 days.', verificationMethod: 'Fleet patch history · 90-day window' },
      { type: 'comparison', text: 'CVE-2024-21302 severity score 8.8 exceeds fleet policy threshold of 7.0.', verificationMethod: 'Policy simulation · NVD CVE database' },
    ],
    expectedImpact: 'Closes active CVE-2024-21302 exposure on WS-4421 with zero expected downtime.',
    confidenceExplanation: 'Strong match between device profile and patch requirements, with high historical success across similar hardware.',
    dataSources: ['Windows Update API', 'Fleet patch history (90 days)', 'NVD CVE database'],
    limitations: 'Does not account for custom software dependencies on this device that may conflict with the patch. Manual validation recommended if device runs legacy middleware.',
    alternatives: [
      { action: 'Defer patch 30 days', rejectionReason: 'Risk window too long given active CVE exploitation in the wild.' },
      { action: 'Apply to test group only', rejectionReason: 'Device is production-critical; deferral not aligned with policy.' },
    ],
    pipelineSteps: defaultPipeline,
    timestamp: '8 min ago',
    awaitingApproval: true,
  },
  {
    id: 'rec-002',
    deviceId: 'LT-2089',
    title: 'Reimage device due to persistent malware signature',
    description: 'Three files matching known ransomware heuristics were flagged over 48 hours. The signature match rate falls below the automated threshold, requiring human review.',
    priority: 'High',
    category: 'Endpoints',
    riskLevel: 'High',
    resourceCount: 1,
    agentsInvolved: ['Risk Assessor', 'Endpoint Scanner', 'Identity Analyst'],
    confidenceLevel: 'review',
    confidencePercent: 68,
    confidenceBreakdown: { dataQuality: 72, consensus: 64, policyMatch: 68 },
    reasoningSteps: [
      { type: 'telemetry', text: 'AV engine flagged 3 files matching known ransomware heuristics over 48 hrs.', verificationMethod: 'Verified against current tenant data · Direct observation' },
      { type: 'comparison', text: 'Signature match rate is 68% — below the 80% threshold for automated quarantine.', verificationMethod: 'Policy simulation · Confidence threshold check' },
      { type: 'history', text: 'Two prior AV alerts on this device in the past 90 days were both false positives.', verificationMethod: 'Device incident log · 90-day window' },
    ],
    expectedImpact: 'Removes persistent malware risk from LT-2089, restoring device to a clean known-good state.',
    confidenceExplanation: 'Partial signature match combined with a history of false positives on this device reduces confidence in automated action.',
    dataSources: ['Endpoint AV telemetry', 'SIEM alert history', 'Device incident log'],
    limitations: 'Heuristic engine version is 14 days behind latest definitions due to a failed update cycle. This may inflate false-positive rate.',
    alternatives: [
      { action: 'Quarantine device only', rejectionReason: 'Quarantine without reimaging may leave dormant payload if infection is confirmed.' },
      { action: 'Run deep scan without action', rejectionReason: 'Scan alone delays response time beyond acceptable risk window.' },
    ],
    pipelineSteps: defaultPipeline,
    timestamp: '23 min ago',
    awaitingApproval: true,
  },
  {
    id: 'rec-003',
    deviceId: 'SRV-0012',
    title: 'Increase RAM allocation from 16 GB to 32 GB',
    description: 'Sustained memory pressure above 89% utilization over 30 days is causing OOM events and degrading service response times.',
    priority: 'Medium',
    category: 'Devices',
    riskLevel: 'Medium',
    resourceCount: 1,
    agentsInvolved: ['Risk Assessor', 'Policy Validator'],
    confidenceLevel: 'high',
    confidencePercent: 91,
    confidenceBreakdown: { dataQuality: 94, consensus: 90, policyMatch: 88 },
    reasoningSteps: [
      { type: 'telemetry', text: 'Memory utilization averaged 89% over the last 30 days with regular OOM events logged.', verificationMethod: 'Verified against current tenant data · 30-day telemetry' },
      { type: 'comparison', text: 'Similar servers running equivalent workloads perform 40% better at 32 GB.', verificationMethod: 'Peer comparison · Fleet benchmark data' },
      { type: 'history', text: 'Two performance tickets linked to this device in the past 60 days cite memory pressure.', verificationMethod: 'Helpdesk ticket system · 60-day window' },
    ],
    expectedImpact: 'Eliminates OOM events on SRV-0012 and restores expected service response times within 24 hours.',
    confidenceExplanation: 'Consistent telemetry data and direct peer comparison strongly support the upgrade recommendation.',
    dataSources: ['Server performance metrics (30-day)', 'CMDB hardware inventory', 'Helpdesk ticket system'],
    limitations: 'Does not evaluate whether the memory pressure originates from a memory leak in application code, which would require a fix rather than additional hardware.',
    alternatives: [
      { action: 'Restart application services', rejectionReason: 'Restart only provides temporary relief and does not address root cause.' },
      { action: 'Migrate workload to cloud VM', rejectionReason: 'Migration complexity is high relative to a straightforward hardware upgrade.' },
    ],
    pipelineSteps: defaultPipeline,
    timestamp: '1 hr ago',
    awaitingApproval: false,
  },
  {
    id: 'rec-004',
    deviceId: 'ES-3862',
    title: 'Network quarantine — unusual outbound traffic pattern',
    description: 'Outbound connections to threat-intel-flagged IPs were observed during off-hours. Traffic volume is elevated versus peers but below absolute threshold.',
    priority: 'High',
    category: 'Network',
    riskLevel: 'High',
    resourceCount: 3,
    agentsInvolved: ['Risk Assessor', 'Identity Analyst', 'Policy Validator', 'Endpoint Scanner'],
    confidenceLevel: 'review',
    confidencePercent: 71,
    confidenceBreakdown: { dataQuality: 68, consensus: 73, policyMatch: 71 },
    reasoningSteps: [
      { type: 'telemetry', text: 'Outbound traffic to 3 IPs flagged in threat intel feed between 02:00–04:00 local time.', verificationMethod: 'Network flow logs · NDR platform' },
      { type: 'history', text: 'Device has no prior anomaly flags in 180-day baseline window.', verificationMethod: 'Baseline comparison · 180-day window' },
      { type: 'comparison', text: 'Traffic volume is 2× above peer devices but not outside absolute threshold.', verificationMethod: 'Peer comparison · Fleet traffic baseline' },
    ],
    expectedImpact: 'Isolates ES-3862 from lateral movement risk while investigation proceeds, with minimal operational disruption.',
    confidenceExplanation: 'Traffic pattern is suspicious but not definitively malicious — clean baseline and ambiguous volume metrics reduce certainty.',
    dataSources: ['Network flow logs (NDR)', 'Threat intel feed (AlienVault OTX)', 'Peer device traffic baseline'],
    limitations: 'Threat intel feed was last refreshed 6 hours ago. One of the flagged IPs may have been recently removed from blocklists.',
    alternatives: [
      { action: 'Block specific IPs via firewall rule', rejectionReason: 'Does not isolate device if additional undiscovered C2 channels are active.' },
      { action: 'Increase monitoring only', rejectionReason: 'Passive monitoring delays containment if this is a confirmed incident.' },
    ],
    pipelineSteps: defaultPipeline,
    timestamp: '34 min ago',
    awaitingApproval: true,
  },
  {
    id: 'rec-005',
    deviceId: 'LT-3301',
    title: 'Rotate BitLocker recovery key',
    description: 'BitLocker recovery key has exceeded the 365-day policy maximum by 183 days. Silent automated rotation is supported on this device.',
    priority: 'Medium',
    category: 'Identity',
    riskLevel: 'Medium',
    resourceCount: 1,
    agentsInvolved: ['Policy Validator', 'Endpoint Scanner'],
    confidenceLevel: 'high',
    confidencePercent: 97,
    confidenceBreakdown: { dataQuality: 99, consensus: 97, policyMatch: 100 },
    reasoningSteps: [
      { type: 'history', text: 'Recovery key has not been rotated in 548 days, exceeding the 365-day policy maximum.', verificationMethod: 'Policy simulation · Compliance calendar' },
      { type: 'telemetry', text: 'Device is Azure AD joined and supports silent key rotation without user disruption.', verificationMethod: 'Verified against current tenant data · AAD API' },
      { type: 'comparison', text: '98% of fleet devices have keys rotated within policy — this is an outlier.', verificationMethod: 'Fleet compliance dashboard · Peer comparison' },
    ],
    expectedImpact: 'Brings LT-3301 into full BitLocker compliance policy with no user interruption.',
    confidenceExplanation: 'Clear policy violation with a low-risk, fully automated remediation path makes this a high-confidence, low-friction action.',
    dataSources: ['Azure AD device compliance API', 'BitLocker management policy', 'Fleet compliance dashboard'],
    limitations: 'If the device is currently offline or disconnected from AAD, the rotation command will queue and execute on next check-in, which may take up to 24 hours.',
    alternatives: [
      { action: 'Exempt device from rotation policy', rejectionReason: 'Policy exemption sets a compliance precedent and does not address the underlying key age issue.' },
    ],
    pipelineSteps: defaultPipeline,
    timestamp: '2 hr ago',
    awaitingApproval: false,
  },
  {
    id: 'rec-006',
    deviceId: 'WS-7754',
    title: 'Uninstall unauthorized software: "CryptoMiner Pro v2"',
    description: 'Process name matches a blocked application. However, the same signature has produced false positives on 4 other fleet devices and may be a vendor-renamed encoder.',
    priority: 'High',
    category: 'Endpoints',
    riskLevel: 'High',
    resourceCount: 1,
    agentsInvolved: ['Endpoint Scanner', 'Risk Assessor'],
    confidenceLevel: 'low',
    confidencePercent: 52,
    confidenceBreakdown: { dataQuality: 55, consensus: 48, policyMatch: 54 },
    reasoningSteps: [
      { type: 'telemetry', text: 'Process name matches a blocked application on the software blocklist.', verificationMethod: 'Software inventory agent · Blocklist v3.4' },
      { type: 'comparison', text: 'CPU utilization spikes (95%) correlate with process run times — consistent with mining behavior.', verificationMethod: 'CPU telemetry · Behavioral correlation' },
      { type: 'history', text: 'Process name has been observed on 4 other devices where it was confirmed as a false positive.', verificationMethod: 'Fleet incident log · Historical comparison' },
    ],
    expectedImpact: 'Removes suspected unauthorized mining software, reducing CPU load and policy exposure on WS-7754.',
    confidenceExplanation: 'Process name match is low-specificity and the fleet history of false positives for this signature significantly undermines confidence.',
    dataSources: ['Software inventory agent', 'CPU telemetry', 'Software blocklist v3.4'],
    limitations: 'Blocklist entry is based solely on process name, not cryptographic hash. Name collision with legitimate software is a documented known issue in blocklist v3.4.',
    alternatives: [
      { action: 'Flag for manual admin investigation', rejectionReason: 'Increases time-to-resolution but avoids disrupting legitimate software.' },
      { action: 'Kill process without uninstalling', rejectionReason: 'Process will restart on next login if software persists.' },
    ],
    pipelineSteps: defaultPipeline,
    timestamp: '3 hr ago',
    awaitingApproval: true,
  },
  {
    id: 'rec-007',
    deviceId: 'MB-1192',
    title: 'Enable FileVault full-disk encryption',
    description: 'FileVault is disabled on this MacBook — the only non-compliant device in its group. A deployment error during onboarding is the likely cause.',
    priority: 'Medium',
    category: 'Identity',
    riskLevel: 'Medium',
    resourceCount: 1,
    agentsInvolved: ['Policy Validator', 'Endpoint Scanner'],
    confidenceLevel: 'high',
    confidencePercent: 88,
    confidenceBreakdown: { dataQuality: 91, consensus: 87, policyMatch: 88 },
    reasoningSteps: [
      { type: 'telemetry', text: 'FileVault is currently disabled — confirmed via MDM compliance check.', verificationMethod: 'Verified against current tenant data · Jamf MDM' },
      { type: 'comparison', text: 'All 47 other MacBooks in the fleet have FileVault enabled; this device is the sole exception.', verificationMethod: 'Peer comparison · Fleet compliance dashboard' },
      { type: 'history', text: 'Device was enrolled 60 days ago; onboarding scripts should have enabled FileVault but a deployment error was logged.', verificationMethod: 'Device onboarding log · Deployment history' },
    ],
    expectedImpact: 'Closes the encryption compliance gap for MB-1192, achieving 100% FileVault coverage in the MacBook fleet.',
    confidenceExplanation: 'Compliance gap is clearly identified with a straightforward MDM-push remediation and no known blockers.',
    dataSources: ['Jamf MDM compliance reports', 'macOS FileVault status API', 'Device onboarding log'],
    limitations: 'First-time FileVault encryption requires the user to be logged in and may cause a 1–2% performance overhead during the initial encryption pass.',
    alternatives: [
      { action: 'Defer until next user login', rejectionReason: 'Deferral window is indeterminate and leaves device non-compliant in the interim.' },
    ],
    pipelineSteps: defaultPipeline,
    timestamp: '5 hr ago',
    awaitingApproval: false,
  },
  {
    id: 'rec-008',
    deviceId: 'WS-0934',
    title: 'Decommission idle workstation (90+ days inactive)',
    description: 'No login events in 94 days. Device was last assigned to a contractor whose engagement ended 3 months ago. A pending HR re-assignment may affect this decision.',
    priority: 'Low',
    category: 'Devices',
    riskLevel: 'Low',
    resourceCount: 1,
    agentsInvolved: ['Policy Validator', 'Identity Analyst'],
    confidenceLevel: 'review',
    confidencePercent: 74,
    confidenceBreakdown: { dataQuality: 78, consensus: 70, policyMatch: 74 },
    reasoningSteps: [
      { type: 'telemetry', text: 'No login events detected in 94 days; device shows as online via ping but with no active sessions.', verificationMethod: 'Active Directory login events · Real-time check' },
      { type: 'history', text: 'Device was last assigned to a contractor whose contract ended 3 months ago.', verificationMethod: 'CMDB asset records · HR system sync' },
      { type: 'comparison', text: 'Fleet policy flags devices inactive for 90+ days for review, but does not mandate automatic decommission.', verificationMethod: 'Policy simulation · Fleet policy engine' },
    ],
    expectedImpact: 'Recovers one device license seat and removes a dormant attack surface from the fleet inventory.',
    confidenceExplanation: 'Inactivity data is clear, but HR system records a pending re-assignment that may not yet be reflected in CMDB — manual verification needed.',
    dataSources: ['Active Directory login events', 'CMDB asset records', 'HR system (read-only sync)'],
    limitations: 'CMDB and HR system sync runs every 24 hours; a re-assignment processed today may not appear until tomorrow. Acting on stale data could decommission a device earmarked for a new hire.',
    alternatives: [
      { action: 'Suspend device (reversible)', rejectionReason: 'Suspension preserves data but keeps the device consuming a license seat.' },
      { action: 'Reassign to spare pool', rejectionReason: 'Spare pool reassignment requires CMDB ticket approval — slower than decommission for a confirmed idle asset.' },
    ],
    pipelineSteps: defaultPipeline,
    timestamp: '6 hr ago',
    awaitingApproval: true,
  },
];

// ── Profile / user mock data ─────────────────────────────────────────────────
export const currentUser = {
  name: 'Alex Smith',
  initials: 'AS',
  role: 'Global Administrator',
  org: 'Acme Corp — IT Security',
  email: 'alex.smith@acmecorp.io',
  memberSince: 'March 12, 2022',
  mfaMethod: 'sms' as 'sms' | 'totp' | 'hardware',
  // Trust calibration
  overrideAccuracy: 87,
  teamAvgOverrideAccuracy: 79,
  totalDecisions: 142,
  agreementRate: 74,   // % approved AI as-is
  avgReviewTimeMins: 3.8,
  // Monthly override accuracy trend (last 6 months)
  overrideTrend: [
    { month: 'Jan', accuracy: 81 },
    { month: 'Feb', accuracy: 78 },
    { month: 'Mar', accuracy: 83 },
    { month: 'Apr', accuracy: 85 },
    { month: 'May', accuracy: 84 },
    { month: 'Jun', accuracy: 87 },
  ],
  // Permissions
  canApproveCategories: ['Identity', 'Endpoints', 'Network', 'Devices'] as Category[],
  maxRiskLevel: 'High' as Priority,
  approverChainPosition: 1,
  // Notifications
  notifications: {
    highPriority: true,
    slaWarnings: true,
    agentDissent: false,
    weeklySummary: true,
  },
  // Sessions
  sessions: [
    { id: 's1', device: 'MacBook Pro 16" (Chrome)', lastActive: 'Active now',       current: true  },
    { id: 's2', device: 'iPhone 15 Pro (Safari)',    lastActive: '2 hours ago',      current: false },
    { id: 's3', device: 'Windows 11 Desktop (Edge)', lastActive: 'Yesterday, 4 PM', current: false },
  ],
};

export const auditLog = [
  { id: 'log-001', time: 'Jun 20, 2:14 PM', recId: 'rec-004', actor: 'J. Watson', actorType: 'human' as const, activity: 'Approved quarantine recommendation', target: 'ES-3862', result: 'success' as const, resultLabel: 'Executed' },
  { id: 'log-002', time: 'Jun 20, 11:03 AM', recId: 'rec-001', actor: 'M. Chen', actorType: 'human' as const, activity: 'Approved patch deployment', target: 'WS-4421', result: 'success' as const, resultLabel: 'Patch applied' },
  { id: 'log-003', time: 'Jun 19, 4:50 PM', recId: 'rec-006', actor: 'R. Patel', actorType: 'human' as const, activity: 'Escalated for manual investigation', target: 'WS-7754', result: 'pending' as const, resultLabel: 'Under investigation' },
  { id: 'log-004', time: 'Jun 19, 1:22 PM', recId: 'rec-005', actor: 'Risk Assessor', actorType: 'agent' as const, activity: 'Generated compliance recommendation', target: 'LT-3301', result: 'success' as const, resultLabel: 'Key rotated' },
  { id: 'log-005', time: 'Jun 18, 9:45 AM', recId: 'rec-003', actor: 'J. Watson', actorType: 'human' as const, activity: 'Rejected RAM upgrade recommendation', target: 'SRV-0012', result: 'rejected' as const, resultLabel: 'Reason recorded' },
  { id: 'log-006', time: 'Jun 17, 3:31 PM', recId: 'rec-007', actor: 'T. Nguyen', actorType: 'human' as const, activity: 'Approved FileVault enforcement', target: 'MB-1192', result: 'success' as const, resultLabel: 'Encrypted' },
  { id: 'log-007', time: 'Jun 17, 10:18 AM', recId: 'rec-002', actor: 'Endpoint Scanner', actorType: 'agent' as const, activity: 'Flagged malware signature match', target: 'LT-2089', result: 'rejected' as const, resultLabel: 'False positive confirmed' },
  { id: 'log-008', time: 'Jun 16, 2:05 PM', recId: 'rec-008', actor: 'T. Nguyen', actorType: 'human' as const, activity: 'Escalated decommission to HR review', target: 'WS-0934', result: 'pending' as const, resultLabel: 'Pending HR check' },
  { id: 'log-009', time: 'Jun 15, 11:47 AM', recId: 'rec-001', actor: 'Policy Validator', actorType: 'agent' as const, activity: 'Auto-approved low-risk patch', target: 'WS-2201', result: 'success' as const, resultLabel: 'Patch applied' },
];
