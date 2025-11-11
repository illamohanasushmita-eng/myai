import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

/**
 * Add a task via voice command
 */
export async function addTaskVoice(
  taskText: string,
  userId: string,
  dueDate?: string | ((path: string) => void),
  onNavigate?: (path: string) => void
): Promise<{ success: boolean; message: string; error?: string }> {
  try {
    // Handle backward compatibility - if dueDate is a function, it's actually onNavigate
    let actualDueDate: string | undefined;
    let actualOnNavigate: ((path: string) => void) | undefined;

    if (typeof dueDate === 'function') {
      actualOnNavigate = dueDate;
      actualDueDate = undefined;
    } else {
      actualDueDate = dueDate;
      actualOnNavigate = onNavigate;
    }

    // Determine task category based on content
    const category = determineTaskCategory(taskText);

    // Navigate immediately for instant feedback
    const targetPath = category === 'professional' ? '/professional' : '/tasks';
    if (actualOnNavigate) {
      actualOnNavigate(targetPath);
    } else {
      window.location.href = targetPath;
    }

    // Create task in background without blocking
    createTaskInBackground(taskText, userId, category, actualDueDate);

    return {
      success: true,
      message: `Task "${taskText}" added successfully`,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('❌ Error adding task:', errorMessage);
    return {
      success: false,
      message: 'Failed to add task',
      error: errorMessage,
    };
  }
}

/**
 * Determine if a task is professional/meeting-related or personal
 */
function determineTaskCategory(taskText: string): 'professional' | 'personal' {
  const lowerText = taskText.toLowerCase();

  // Professional/meeting keywords - concise list
  const professionalKeywords = [
    'meeting', 'call', 'conference', 'appointment', 'schedule', 'client', 'presentation',
    'project', 'deadline', 'report', 'email', 'follow up', 'follow-up', 'sync', 'standup',
    'review', 'proposal', 'contract', 'negotiation', 'pitch', 'demo', 'webinar', 'training',
    'workshop', 'seminar', 'conference call', 'team meeting', 'one on one', 'one-on-one',
    'brainstorm', 'planning', 'strategy', 'budget', 'quarterly', 'annual', 'performance',
    'evaluation', 'feedback', 'interview', 'hiring', 'recruitment', 'onboarding', 'offboarding',
    'work', 'office', 'business', 'corporate', 'professional', 'job', 'career', 'promotion',
    'raise', 'salary', 'benefits', 'hr', 'human resources', 'payroll', 'invoice', 'billing',
    'vendor', 'supplier', 'partner', 'stakeholder', 'executive', 'ceo', 'cto', 'cfo', 'board',
    'investor', 'acquisition', 'merger', 'ipo', 'funding', 'pitch deck', 'business plan',
    'market research', 'competitor analysis', 'swot', 'kpi', 'metrics', 'analytics', 'dashboard',
    'deck', 'slides', 'keynote', 'speech', 'talk', 'panel', 'roundtable', 'networking',
    'summit', 'expo', 'trade show', 'booth', 'sponsor', 'exhibitor', 'attendee', 'speaker',
    'moderator', 'panelist', 'audience', 'participants', 'delegates', 'guests', 'vip',
    'dignitaries', 'officials', 'government', 'regulatory', 'compliance', 'audit', 'legal',
    'attorney', 'lawyer', 'counsel', 'litigation', 'dispute', 'arbitration', 'mediation',
    'settlement', 'agreement', 'terms', 'conditions', 'nda', 'non-disclosure', 'confidentiality',
    'intellectual property', 'patent', 'trademark', 'copyright', 'licensing', 'royalty',
    'commission', 'revenue', 'profit', 'loss', 'expense', 'cost', 'forecast', 'projection',
    'scenario', 'analysis', 'modeling', 'simulation', 'optimization', 'efficiency', 'productivity',
    'quality', 'excellence', 'innovation', 'disruption', 'transformation', 'digital', 'technology',
    'software', 'hardware', 'infrastructure', 'cloud', 'data', 'database', 'server', 'network',
    'security', 'cybersecurity', 'encryption', 'authentication', 'authorization', 'access control',
    'firewall', 'vpn', 'api', 'integration', 'migration', 'deployment', 'release', 'version',
    'build', 'test', 'qa', 'uat', 'production', 'staging', 'development', 'debugging',
    'troubleshooting', 'support', 'ticket', 'issue', 'bug', 'feature', 'enhancement',
    'improvement', 'refactoring', 'documentation', 'wiki', 'knowledge base', 'faq', 'tutorial',
    'guide', 'manual', 'handbook', 'policy', 'procedure', 'process', 'workflow', 'automation',
    'webhook', 'event', 'notification', 'alert', 'monitoring', 'logging', 'tracing', 'profiling',
    'benchmarking', 'load testing', 'stress testing', 'penetration testing', 'security audit',
    'code review', 'peer review', 'pull request', 'merge', 'branch', 'commit', 'push', 'pull',
    'fetch', 'rebase', 'cherry pick', 'stash', 'tag', 'changelog', 'roadmap', 'backlog',
    'sprint', 'agile', 'scrum', 'kanban', 'lean', 'six sigma', 'tpm', 'tqm', 'kaizen',
    'jidoka', 'just in time', 'value stream', 'waste elimination', 'continuous improvement',
    'root cause analysis', 'fishbone', 'pareto', 'abc analysis', 'xyz analysis', 'vendor management',
    'supplier relationship', 'procurement', 'purchasing', 'sourcing', 'contract management',
    'sla', 'service level agreement', 'oee', 'overall equipment effectiveness', 'mtbf',
    'mean time between failures', 'mttr', 'mean time to repair', 'rca', 'fmea',
    'failure mode and effects analysis', 'hazop', 'hazard and operability', 'lopa',
    'layer of protection analysis', 'bow tie', 'risk matrix', 'risk assessment', 'risk management',
    'business continuity', 'disaster recovery', 'crisis management', 'incident management',
    'change management', 'project management', 'portfolio management', 'program management',
    'resource management', 'capacity planning', 'demand planning', 'supply planning',
    'inventory management', 'warehouse management', 'logistics', 'transportation', 'distribution',
    'fulfillment', 'order management', 'customer relationship', 'crm', 'sales', 'marketing',
    'advertising', 'branding', 'public relations', 'communications', 'social media',
    'content marketing', 'seo', 'sem', 'ppc', 'email marketing', 'direct mail', 'telemarketing',
    'event marketing', 'sponsorship', 'partnership', 'affiliate', 'referral', 'loyalty',
    'retention', 'churn', 'acquisition', 'conversion', 'funnel', 'pipeline', 'quota',
    'incentive', 'bonus', 'award', 'recognition', 'celebration', 'team building', 'morale',
    'culture', 'values', 'mission', 'vision', 'tactics', 'execution', 'accountability',
    'transparency', 'integrity', 'ethics', 'governance', 'opportunity', 'threat', 'strength',
    'weakness', 'competitive advantage', 'differentiation', 'positioning', 'market share',
    'market penetration', 'market development', 'product development', 'diversification',
    'vertical integration', 'horizontal integration', 'outsourcing', 'insourcing', 'offshoring',
    'nearshoring', 'reshoring', 'globalization', 'localization', 'internationalization',
    'expansion', 'contraction', 'consolidation', 'restructuring', 'reorganization', 'downsizing',
    'rightsizing', 'layoff', 'severance', 'retirement', 'pension', '401k', 'ira', 'roth',
    'stock option', 'restricted stock', 'equity', 'vesting', 'cliff', 'acceleration', 'clawback',
    'golden parachute', 'poison pill', 'white knight', 'hostile takeover', 'friendly acquisition',
    'leveraged buyout', 'management buyout', 'ipo roadshow', 'underwriter', 'prospectus', 'sec',
    'sec filing', '10-k', '10-q', '8-k', 'proxy statement', 'annual report', 'quarterly report',
    'earnings call', 'earnings release', 'guidance', 'forward looking statement', 'safe harbor',
    'materiality', 'disclosure', 'fiduciary duty', 'duty of care', 'duty of loyalty',
    'conflict of interest', 'related party transaction', 'arm\'s length', 'fair value', 'goodwill',
    'intangible asset', 'tangible asset', 'depreciation', 'amortization', 'impairment',
    'write-off', 'write-down', 'reserve', 'provision', 'contingency', 'accrual', 'deferral',
    'revenue recognition', 'expense recognition', 'matching principle', 'conservatism',
    'consistency', 'comparability', 'verifiability', 'representational faithfulness', 'neutrality',
    'completeness', 'timeliness', 'understandability', 'relevance', 'reliability', 'gaap',
    'ifrs', 'us gaap', 'ifrs standards', 'accounting standards', 'auditing standards',
    'sarbanes-oxley', 'sox', 'dodd-frank', 'basel', 'mifid', 'gdpr', 'ccpa', 'hipaa', 'pci dss',
    'iso', 'iso 9001', 'iso 27001', 'iso 14001', 'iso 45001', 'iso 50001', 'iso 55001',
    'coso', 'coso framework', 'erm', 'enterprise risk management', 'three lines of defense',
    'first line', 'second line', 'third line', 'internal audit', 'external audit', 'audit committee',
    'risk committee', 'compliance committee', 'ethics committee', 'compensation committee',
    'nominating committee', 'governance committee', 'board of directors', 'board meeting',
    'board resolution', 'board minutes', 'board charter', 'board evaluation', 'board succession',
    'board diversity', 'board independence', 'lead director', 'board chair', 'coo', 'ciso',
    'chief risk officer', 'chief compliance officer', 'chief audit executive', 'chief ethics officer',
    'chief sustainability officer', 'chief diversity officer', 'chief people officer',
    'chief marketing officer', 'chief sales officer', 'chief product officer', 'chief technology officer',
    'chief information officer', 'chief data officer', 'chief analytics officer', 'chief innovation officer',
    'chief transformation officer', 'chief strategy officer', 'chief financial officer',
    'chief operating officer', 'chief executive officer', 'president', 'vice president',
    'senior vice president', 'executive vice president', 'managing director', 'director',
    'senior director', 'manager', 'senior manager', 'associate', 'senior associate', 'analyst',
    'senior analyst', 'specialist', 'senior specialist', 'coordinator', 'senior coordinator',
    'administrator', 'senior administrator', 'assistant', 'senior assistant', 'intern', 'fellow',
    'consultant', 'contractor', 'customer', 'prospect', 'lead', 'opportunity', 'deal',
    'transaction', 'engagement', 'initiative', 'portfolio', 'campaign', 'promotion'
  ];

  return professionalKeywords.some(keyword => lowerText.includes(keyword)) ? 'professional' : 'personal';
}

/**
 * Create task in background without blocking UI
 */
async function createTaskInBackground(
  taskText: string,
  userId: string,
  category: 'professional' | 'personal',
  dueDate?: string
): Promise<void> {
  try {
    const { error } = await supabase.from('tasks').insert([
      {
        user_id: userId,
        title: taskText,
        description: '',
        due_date: dueDate || new Date().toISOString().split('T')[0],
        category: category,
        status: 'pending',
        priority: 'medium',
        created_at: new Date().toISOString(),
      },
    ]);

    if (error) {
      console.error('❌ Error creating task in background:', error);
    } else {
      console.log('✅ Task created successfully in background');
    }
  } catch (error) {
    console.error('❌ Error in createTaskInBackground:', error);
  }
}

