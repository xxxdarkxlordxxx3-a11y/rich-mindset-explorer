
// FIX: Removed self-import of GroundingChunk which was causing a name conflict.

export interface UserContext {
    activity: string;
    location?: {
      coords: {
        latitude: number;
        longitude: number;
      };
    };
}

export interface SuccessStory {
    type: 'success';
    name: string;
    age: number;
    netWorth: string;
    sourceOfWealth: string;
    bio: string;
    story: string;
    startYear: number;
    timeToWealth: string;
    timeline: string;
    lessons: string[];
    otherInvestments: string[];
}

export interface FailureStory {
    type: 'failure';
    name: string;
    peakNetWorth: string; // The max money they had before losing it
    lossAmount: string; // How much was lost/debt
    causeOfFailure: string;
    bio: string;
    story: string;
    mistakes: string[]; // Replacing lessons
    consequences: string[]; // What happened to them
}

export type Story = SuccessStory | FailureStory;

export type ToolType = 'mindset' | 'risk' | 'budgeting' | 'investment' | 'tools' | 'reading' | 'rules';

export interface ChatMessage {
    id: string;
    role: 'user' | 'model';
    text: string;
}

export type QuestionType = 'mc' | 'tf' | 'input' | 'matching';

export interface QuizOption {
    text: string;
    mindset?: 'rich' | 'poor' | 'balanced' | 'effective' | 'ineffective' | 'average' | 'correct/knowledgeable' | 'incorrect' | 'partially correct or common misconception';
}

export interface MatchingPair {
    left: string;
    right: string;
}

export interface QuizQuestion {
    type: QuestionType;
    question: string;
    options?: QuizOption[]; // For MC and TF
    pairs?: MatchingPair[]; // For Matching
    correctAnswerLabel?: string; // For Input questions (guide for AI grading) or TF
    feedback: string;
}

export interface RiskQuestion {
    question: string;
    options: string[];
}

export interface UserRiskAnswer {
    question: string;
    answer: string;
}

export interface RiskProfile {
    profile: string;
    description: string;
    allocation: {
      highRisk: number;
      lowRisk: number;
    };
    assetComfort: {
      stocks: number;
      bonds: number;
      realEstate: number;
      commodities: number;
    };
    explanation: string;
    overallRiskPercentage: number;
    lossAversionPercentage: number;
    lossAversionExplanation: string;
    investmentHorizon: 'short-term' | 'medium-term' | 'long-term';
    investmentHorizonDescription: string;
    definitions: {
      shortTerm: string;
      mediumTerm: string;
      longTerm: string;
    };
}

export interface BudgetItem {
    id: string;
    category: string;
    amount: number | '';
    type: 'variable' | 'fixed';
}

export interface InvestmentPlan {
    planName: string;
    summary: string;
    assetAllocation: { [key: string]: number };
    strategies: string[];
    disclaimer: string;
}
export interface ExpenseBreakdown {
    category: string;
    amount: number;
    percentage: number;
}

export interface BudgetAnalysis {
    summary: string;
    keyMetrics: {
        totalIncome: number;
        totalExpenses: number;
        netSavings: number;
        savingsRate: number; 
    };
    expenseBreakdown: {
        fixed: ExpenseBreakdown[];
        variable: ExpenseBreakdown[];
        totalFixed: number;
        totalVariable: number;
    };
    positivePoints: string[];
    areasForImprovement: {
        area: string;
        suggestion: string;
        potentialSavings?: string;
    }[];
}

export interface Book {
    title: string;
    author: string;
    summary: string;
    coverImage: string;
    url: string;
}

export interface CashFlowItem {
    item: string;
    amount: number;
}

interface CashFlowActivity {
    inflows: CashFlowItem[];
    outflows: CashFlowItem[];
    netCashFlow: number;
}

export interface CashFlowStatement {
    operatingActivities: CashFlowActivity;
    investingActivities: CashFlowActivity;
    financingActivities: CashFlowActivity;
    summary: {
      netIncreaseInCash: number;
      beginningCashBalance: number;
      endingCashBalance: number;
    };
    analysis: string;
}

export interface UserAnswer {
    questionIndex: number;
    // For MC/TF: index of option. For Input: string text. For Matching: array of pairs.
    answerContent: number | string | {left: string, right: string}[]; 
}

export interface QuizAnalysis {
    scorePercentage: number;
    overallFeedback: string;
    growthOpportunities: {
      question: string;
      yourAnswer: string;
      richMindsetAnswer: string;
      explanation: string;
    }[];
}

export interface GeneratedContent {
    title: string;
    explanation: string;
    example?: string;
    keyPoints: string[];
}

export interface AgentInterpretation {
    command: 'generate_content' | 'fetch_news' | 'recommend_books' | 'suggest_ideas' | 'show_component' | 'show_help' | 'unknown';
    content_topic?: string;
    news_category?: string;
    component_name?: 'QuizSection' | 'RiskAnalysisSection' | 'FinancialToolsSection';
    component_props?: {
      quizType?: 'mindset' | 'budgeting' | 'investment';
    };
    response_to_user: string;
}

export interface VideoData {
    id: string;
    title: string;
    thumbnail: string;
}

export interface GroundingChunk {
    web: {
        uri: string;
        title: string;
    };
}

export interface NewsData {
  text: string;
  sources: GroundingChunk[];
}

export interface FinancialRule {
    titleKey: string;
    explanationKey: string;
    exampleKey: string;
}
