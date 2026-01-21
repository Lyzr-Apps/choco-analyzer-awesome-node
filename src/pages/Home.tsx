import { useState, useCallback } from 'react'
import { callAIAgent, type NormalizedAgentResponse } from '@/utils/aiAgent'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Textarea } from '@/components/ui/textarea'
import {
  LayoutDashboard,
  Upload,
  History,
  Settings,
  TrendingUp,
  TrendingDown,
  BarChart3,
  PieChart,
  AlertCircle,
  CheckCircle,
  Loader2,
  FileText,
  Download,
  Play,
  ChevronRight,
  LineChart,
  Target,
  Lightbulb,
  AlertTriangle,
  Clock,
  Calendar
} from 'lucide-react'
import { cn } from '@/lib/utils'

// =============================================================================
// Agent IDs from workflow.json
// =============================================================================
const AGENT_IDS = {
  ANALYSIS_COORDINATOR: '6971045dd6d0dcaec11187d7',
  DATA_VALIDATION: '697103d01d92f5e2dd22ae59',
  SOM_SOV_CALCULATOR: '697103e71d92f5e2dd22ae5f',
  COMPETITIVE_INTELLIGENCE: '697104041d92f5e2dd22ae71',
  STRATEGIC_ADVISOR: '697104281d92f5e2dd22ae7c',
}

// =============================================================================
// TypeScript Interfaces from ACTUAL response schemas
// =============================================================================

// Analysis Coordinator Response
interface ValidationSummary {
  data_quality_status: string
  issues_found: any[]
  total_brands_analyzed: number
}

interface MarketMetrics {
  total_market_share: number
  total_voice_share: number
  top_brand_som: number
  top_brand_sov: number
  efficiency_leader: string
}

interface CompetitiveInsights {
  market_trends: string[]
  competitor_activities: string[]
  industry_developments: string[]
}

interface StrategicRecommendations {
  priority_actions: string[]
  risk_areas: string[]
  opportunity_areas: string[]
}

interface AnalysisCoordinatorResult {
  validation_summary: ValidationSummary
  market_metrics: MarketMetrics
  competitive_insights: CompetitiveInsights
  strategic_recommendations: StrategicRecommendations
}

// SOM/SOV Calculator Response
interface BrandMetric {
  brand_name: string
  som_percentage: number
  sov_percentage: number
  som_sov_ratio: number
  market_rank: number
  sales_value: number
  ad_spend: number
}

interface MarketTotals {
  total_sales: number
  total_ad_spend: number
  total_brands: number
}

interface Trends {
  mom_change: number
  yoy_change: number | null
  trend_direction: string
}

interface Benchmarks {
  market_leader: string
  voice_leader: string
  most_efficient: string
}

interface SOMSOVCalculatorResult {
  brand_metrics: BrandMetric[]
  market_totals: MarketTotals
  trends: Trends
  benchmarks: Benchmarks
  insights: string[]
}

// Data Validation Response
interface CompletenessCheck {
  missing_fields: string[]
  completeness_percentage: number
}

interface FormatError {
  field: string
  issue: string
}

interface FormatCheck {
  format_errors: FormatError[]
  format_valid: boolean
}

interface Anomaly {
  field: string
  value: string
  reason: string
}

interface AnomalyDetection {
  anomalies_found: Anomaly[]
  anomaly_count: number
}

interface DataValidationResult {
  validation_passed: boolean
  quality_score: number
  completeness_check: CompletenessCheck
  format_check: FormatCheck
  anomaly_detection: AnomalyDetection
  recommendations: string[]
}

// Competitive Intelligence Response
interface MarketTrend {
  trend: string
  impact: string
  description: string
  source: string
}

interface CompetitorActivity {
  competitor: string
  activity: string
  date: string
  significance: string
}

interface IndustryNews {
  headline: string
  summary: string
  date: string
  relevance: string
}

interface ConsumerInsights {
  key_behaviors: string[]
  demographic_shifts: string[]
  purchase_drivers: string[]
}

interface CompetitiveIntelligenceResult {
  market_trends: MarketTrend[]
  competitor_activities: CompetitorActivity[]
  industry_news: IndustryNews[]
  consumer_insights: ConsumerInsights
  strategic_implications: string[]
}

// Strategic Advisor Response
interface SWOTAnalysis {
  strengths: string[]
  weaknesses: string[]
  opportunities: string[]
  threats: string[]
}

interface StrategicRecommendation {
  priority: string
  recommendation: string
  rationale: string
  expected_impact: string
  timeframe: string
  action_steps: string[]
}

interface RiskAssessment {
  risk: string
  likelihood: string
  impact: string
  mitigation: string
}

interface StrategicAdvisorResult {
  executive_summary: string
  swot_analysis: SWOTAnalysis
  strategic_recommendations: StrategicRecommendation[]
  risk_assessment: RiskAssessment[]
  success_metrics: string[]
}

// History Entry
interface HistoryEntry {
  id: string
  date: string
  period: string
  brands: number
  status: 'success' | 'error'
  keyFinding: string
}

// =============================================================================
// Mock Data for History and Dashboard
// =============================================================================
const mockHistory: HistoryEntry[] = [
  {
    id: '1',
    date: '2024-03-15',
    period: 'March 2024',
    brands: 3,
    status: 'success',
    keyFinding: 'Brand B shows highest efficiency with SOV/SOM ratio of 1.13'
  },
  {
    id: '2',
    date: '2024-02-15',
    period: 'February 2024',
    brands: 3,
    status: 'success',
    keyFinding: 'Market share increased by 7.14% MoM'
  },
  {
    id: '3',
    date: '2024-01-15',
    period: 'January 2024',
    brands: 3,
    status: 'success',
    keyFinding: 'Competitive activity increased in premium segment'
  }
]

const mockTrendData = [
  { month: 'Oct', brandSOM: 13, brandSOV: 11, competitorSOM: 15, competitorSOV: 14 },
  { month: 'Nov', brandSOM: 14, brandSOV: 12, competitorSOM: 14, competitorSOV: 13 },
  { month: 'Dec', brandSOM: 15, brandSOV: 13, competitorSOM: 13, competitorSOV: 12 },
  { month: 'Jan', brandSOM: 15, brandSOV: 13.5, competitorSOM: 12, competitorSOV: 11 },
  { month: 'Feb', brandSOM: 16, brandSOV: 14, competitorSOM: 11, competitorSOV: 10 },
  { month: 'Mar', brandSOM: 17, brandSOV: 15, competitorSOM: 10, competitorSOV: 9 }
]

// =============================================================================
// Sidebar Component
// =============================================================================
function Sidebar({ activeView, onNavigate }: { activeView: string; onNavigate: (view: string) => void }) {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'analysis', label: 'New Analysis', icon: Upload },
    { id: 'history', label: 'History', icon: History },
    { id: 'settings', label: 'Settings', icon: Settings }
  ]

  return (
    <div className="w-64 border-r border-[#3D2314]/20 bg-[#FFF8E7] flex flex-col">
      <div className="p-6 border-b border-[#3D2314]/20">
        <h1 className="text-xl font-bold text-[#3D2314] flex items-center gap-2">
          <PieChart className="h-6 w-6 text-[#D4A24C]" />
          SOM/SOV Analyzer
        </h1>
        <p className="text-xs text-[#3D2314]/60 mt-1">Chocolate Snacking Market</p>
      </div>

      <nav className="flex-1 p-4">
        <div className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={cn(
                  'w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors',
                  activeView === item.id
                    ? 'bg-[#3D2314] text-[#FFF8E7]'
                    : 'text-[#3D2314] hover:bg-[#3D2314]/10'
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </button>
            )
          })}
        </div>
      </nav>
    </div>
  )
}

// =============================================================================
// Dashboard View
// =============================================================================
function DashboardView({ onNavigate }: { onNavigate: (view: string) => void }) {
  return (
    <div className="p-8 space-y-8">
      <div>
        <h2 className="text-3xl font-bold text-[#3D2314]">Market Overview</h2>
        <p className="text-[#3D2314]/60 mt-1">Your competitive position in the chocolate snacking market</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-[#3D2314]/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-[#3D2314]/60">Share of Market</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-bold text-[#3D2314]">15.0%</span>
              <Badge className="bg-green-500 text-white border-0">
                <TrendingUp className="h-3 w-3 mr-1" />
                +2.1%
              </Badge>
            </div>
            <p className="text-xs text-[#3D2314]/60 mt-2">vs last period</p>
          </CardContent>
        </Card>

        <Card className="border-[#3D2314]/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-[#3D2314]/60">Share of Voice</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-bold text-[#3D2314]">13.3%</span>
              <Badge className="bg-green-500 text-white border-0">
                <TrendingUp className="h-3 w-3 mr-1" />
                +1.8%
              </Badge>
            </div>
            <p className="text-xs text-[#3D2314]/60 mt-2">vs last period</p>
          </CardContent>
        </Card>

        <Card className="border-[#3D2314]/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-[#3D2314]/60">SOV/SOM Ratio</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-bold text-[#3D2314]">1.13</span>
              <Badge className="bg-[#D4A24C] text-white border-0">Efficient</Badge>
            </div>
            <p className="text-xs text-[#3D2314]/60 mt-2">Above 1.0 target</p>
          </CardContent>
        </Card>
      </div>

      {/* 6-Month Trend Chart */}
      <Card className="border-[#3D2314]/20">
        <CardHeader>
          <CardTitle className="text-[#3D2314] flex items-center gap-2">
            <LineChart className="h-5 w-5 text-[#D4A24C]" />
            6-Month Performance Trend
          </CardTitle>
          <CardDescription className="text-[#3D2314]/60">
            SOM and SOV comparison vs competitors
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-end gap-4 border-l border-b border-[#3D2314]/20 pl-8 pb-8">
            {mockTrendData.map((data, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-2">
                <div className="w-full flex gap-1">
                  <div
                    className="flex-1 bg-[#3D2314] rounded-t"
                    style={{ height: `${data.brandSOM * 10}px` }}
                    title={`Brand SOM: ${data.brandSOM}%`}
                  />
                  <div
                    className="flex-1 bg-[#D4A24C] rounded-t"
                    style={{ height: `${data.brandSOV * 10}px` }}
                    title={`Brand SOV: ${data.brandSOV}%`}
                  />
                </div>
                <span className="text-xs text-[#3D2314]/60">{data.month}</span>
              </div>
            ))}
          </div>
          <div className="flex justify-center gap-6 mt-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-[#3D2314] rounded" />
              <span className="text-xs text-[#3D2314]/60">Brand SOM</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-[#D4A24C] rounded" />
              <span className="text-xs text-[#3D2314]/60">Brand SOV</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Analyses */}
      <Card className="border-[#3D2314]/20">
        <CardHeader>
          <CardTitle className="text-[#3D2314] flex items-center gap-2">
            <Clock className="h-5 w-5 text-[#D4A24C]" />
            Recent Analyses
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-[#3D2314]/20">
                <TableHead className="text-[#3D2314]/60">Date</TableHead>
                <TableHead className="text-[#3D2314]/60">Period</TableHead>
                <TableHead className="text-[#3D2314]/60">Key Finding</TableHead>
                <TableHead className="text-[#3D2314]/60">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockHistory.map((entry) => (
                <TableRow key={entry.id} className="border-[#3D2314]/20">
                  <TableCell className="text-[#3D2314]">{entry.date}</TableCell>
                  <TableCell className="text-[#3D2314]">{entry.period}</TableCell>
                  <TableCell className="text-[#3D2314] text-sm">{entry.keyFinding}</TableCell>
                  <TableCell>
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-[#3D2314]/20 text-[#3D2314] hover:bg-[#3D2314]/10"
                    >
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* CTAs */}
      <div className="flex gap-4">
        <Button
          size="lg"
          className="bg-[#3D2314] hover:bg-[#3D2314]/90 text-[#FFF8E7]"
          onClick={() => onNavigate('analysis')}
        >
          <Upload className="h-4 w-4 mr-2" />
          New Analysis
        </Button>
        <Button
          size="lg"
          variant="outline"
          className="border-[#3D2314]/20 text-[#3D2314] hover:bg-[#3D2314]/10"
        >
          <Download className="h-4 w-4 mr-2" />
          Export Summary
        </Button>
      </div>
    </div>
  )
}

// =============================================================================
// Analysis View (Upload & Configuration)
// =============================================================================
function AnalysisView({ onAnalysisComplete }: { onAnalysisComplete: (response: NormalizedAgentResponse) => void }) {
  const [csvData, setCsvData] = useState('')
  const [previewData, setPreviewData] = useState<string[][]>([])
  const [validationStatus, setValidationStatus] = useState<DataValidationResult | null>(null)
  const [analysisProgress, setAnalysisProgress] = useState<'idle' | 'validating' | 'calculating' | 'researching' | 'recommending' | 'complete'>('idle')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        const text = event.target?.result as string
        setCsvData(text)

        // Parse CSV for preview
        const lines = text.trim().split('\n')
        const preview = lines.slice(0, 10).map(line => line.split(',').map(cell => cell.trim()))
        setPreviewData(preview)
      }
      reader.readAsText(file)
    }
  }

  const handleTextInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value
    setCsvData(text)

    if (text.trim()) {
      const lines = text.trim().split('\n')
      const preview = lines.slice(0, 10).map(line => line.split(',').map(cell => cell.trim()))
      setPreviewData(preview)
    } else {
      setPreviewData([])
    }
  }

  const runAnalysis = async () => {
    if (!csvData.trim()) {
      setError('Please provide market data')
      return
    }

    setLoading(true)
    setError(null)
    setAnalysisProgress('validating')

    try {
      // Call Analysis Coordinator (manager agent)
      const message = `Analyze this chocolate snacking market data:\n\n${csvData}\n\nProvide complete SOM/SOV analysis with validation, calculations, competitive intelligence, and strategic recommendations.`

      setAnalysisProgress('calculating')

      const result = await callAIAgent(message, AGENT_IDS.ANALYSIS_COORDINATOR)

      setAnalysisProgress('researching')

      // Simulate progress for user experience
      await new Promise(resolve => setTimeout(resolve, 1000))
      setAnalysisProgress('recommending')

      await new Promise(resolve => setTimeout(resolve, 1000))
      setAnalysisProgress('complete')

      if (result.success && result.response.status === 'success') {
        onAnalysisComplete(result.response)
      } else {
        setError(result.error || result.response.message || 'Analysis failed')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Network error')
    } finally {
      setLoading(false)
    }
  }

  const progressSteps = [
    { key: 'validating', label: 'Validating Data', icon: CheckCircle },
    { key: 'calculating', label: 'Calculating SOM/SOV', icon: BarChart3 },
    { key: 'researching', label: 'Researching Market', icon: Target },
    { key: 'recommending', label: 'Generating Recommendations', icon: Lightbulb }
  ]

  const getCurrentStep = () => {
    const steps = ['validating', 'calculating', 'researching', 'recommending', 'complete']
    return steps.indexOf(analysisProgress)
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-[#3D2314]">New Market Analysis</h2>
        <p className="text-[#3D2314]/60 mt-1">Upload your market data and run comprehensive SOM/SOV analysis</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column: Data Input */}
        <div className="space-y-6">
          <Card className="border-[#3D2314]/20">
            <CardHeader>
              <CardTitle className="text-[#3D2314] flex items-center gap-2">
                <Upload className="h-5 w-5 text-[#D4A24C]" />
                Upload Market Data
              </CardTitle>
              <CardDescription className="text-[#3D2314]/60">
                CSV or Excel format accepted
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="file-upload" className="text-[#3D2314]">Upload File</Label>
                <Input
                  id="file-upload"
                  type="file"
                  accept=".csv,.xlsx,.xls"
                  onChange={handleFileUpload}
                  className="mt-2 border-[#3D2314]/20 text-[#3D2314]"
                />
              </div>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-[#3D2314]/20" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2 text-[#3D2314]/60">Or paste data</span>
                </div>
              </div>

              <div>
                <Label htmlFor="csv-input" className="text-[#3D2314]">Paste CSV Data</Label>
                <Textarea
                  id="csv-input"
                  placeholder="Brand,Sales_Volume,Sales_Value,Media_Spend,Period&#10;Brand A,7500000,7500000,2000000,March 2024&#10;Brand B,5500000,5500000,1500000,March 2024"
                  value={csvData}
                  onChange={handleTextInput}
                  rows={8}
                  className="mt-2 border-[#3D2314]/20 text-[#3D2314] font-mono text-xs"
                />
              </div>

              <Alert className="border-[#D4A24C]/30 bg-[#D4A24C]/5">
                <FileText className="h-4 w-4 text-[#D4A24C]" />
                <AlertTitle className="text-[#3D2314]">Expected Format</AlertTitle>
                <AlertDescription className="text-[#3D2314]/60 text-xs">
                  Required columns: Brand, Sales_Volume, Sales_Value, Media_Spend, Period
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>

          {/* Data Preview */}
          {previewData.length > 0 && (
            <Card className="border-[#3D2314]/20">
              <CardHeader>
                <CardTitle className="text-[#3D2314] text-sm">Data Preview</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-48">
                  <Table>
                    <TableBody>
                      {previewData.map((row, i) => (
                        <TableRow key={i} className="border-[#3D2314]/20">
                          {row.map((cell, j) => (
                            <TableCell key={j} className="text-xs text-[#3D2314] py-1 px-2">
                              {cell}
                            </TableCell>
                          ))}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </ScrollArea>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column: Analysis Control */}
        <div className="space-y-6">
          <Card className="border-[#3D2314]/20">
            <CardHeader>
              <CardTitle className="text-[#3D2314] flex items-center gap-2">
                <Target className="h-5 w-5 text-[#D4A24C]" />
                Analysis Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="period" className="text-[#3D2314]">Analysis Period</Label>
                <Input
                  id="period"
                  placeholder="e.g., March 2024"
                  className="mt-2 border-[#3D2314]/20 text-[#3D2314]"
                />
              </div>

              <div>
                <Label htmlFor="competitors" className="text-[#3D2314]">Competitor Brands (optional)</Label>
                <Textarea
                  id="competitors"
                  placeholder="Enter competitor brand names, one per line"
                  rows={4}
                  className="mt-2 border-[#3D2314]/20 text-[#3D2314]"
                />
              </div>

              <Button
                onClick={runAnalysis}
                disabled={loading || !csvData.trim()}
                className="w-full bg-[#3D2314] hover:bg-[#3D2314]/90 text-[#FFF8E7]"
                size="lg"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Running Analysis...
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 mr-2" />
                    Run Analysis
                  </>
                )}
              </Button>

              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* Progress Indicator */}
          {loading && analysisProgress !== 'idle' && (
            <Card className="border-[#3D2314]/20">
              <CardHeader>
                <CardTitle className="text-[#3D2314] text-sm">Analysis Progress</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Progress value={(getCurrentStep() / 4) * 100} className="h-2" />

                <div className="space-y-3">
                  {progressSteps.map((step, index) => {
                    const Icon = step.icon
                    const isActive = analysisProgress === step.key
                    const isComplete = getCurrentStep() > index

                    return (
                      <div key={step.key} className="flex items-center gap-3">
                        <div className={cn(
                          'w-8 h-8 rounded-full flex items-center justify-center',
                          isComplete ? 'bg-green-500 text-white' :
                          isActive ? 'bg-[#D4A24C] text-white' :
                          'bg-[#3D2314]/10 text-[#3D2314]/40'
                        )}>
                          {isComplete ? <CheckCircle className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
                        </div>
                        <span className={cn(
                          'text-sm',
                          isActive ? 'text-[#3D2314] font-medium' : 'text-[#3D2314]/60'
                        )}>
                          {step.label}
                        </span>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}

// =============================================================================
// Results View (Comprehensive Analysis Results)
// =============================================================================
function ResultsView({ analysisData, onNavigate }: { analysisData: NormalizedAgentResponse | null; onNavigate: (view: string) => void }) {
  const [activeTab, setActiveTab] = useState('metrics')

  if (!analysisData || !analysisData.result) {
    return (
      <div className="p-8">
        <Alert className="border-[#D4A24C]/30">
          <AlertCircle className="h-4 w-4 text-[#D4A24C]" />
          <AlertTitle className="text-[#3D2314]">No Analysis Data</AlertTitle>
          <AlertDescription className="text-[#3D2314]/60">
            Run an analysis first to view results.
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  const result = analysisData.result as AnalysisCoordinatorResult

  return (
    <div className="p-8 space-y-8">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-3xl font-bold text-[#3D2314]">Analysis Results</h2>
          <p className="text-[#3D2314]/60 mt-1">Comprehensive SOM/SOV market analysis</p>
        </div>

        <div className="flex gap-3">
          <Button
            variant="outline"
            className="border-[#3D2314]/20 text-[#3D2314] hover:bg-[#3D2314]/10"
          >
            <Download className="h-4 w-4 mr-2" />
            Export PDF
          </Button>
          <Button
            variant="outline"
            className="border-[#3D2314]/20 text-[#3D2314] hover:bg-[#3D2314]/10"
          >
            Save to History
          </Button>
          <Button
            className="bg-[#3D2314] hover:bg-[#3D2314]/90 text-[#FFF8E7]"
            onClick={() => onNavigate('analysis')}
          >
            New Analysis
          </Button>
        </div>
      </div>

      {/* Validation Summary Banner */}
      {result.validation_summary && (
        <Alert className={cn(
          'border-2',
          result.validation_summary.data_quality_status === 'Valid'
            ? 'border-green-500/30 bg-green-50'
            : 'border-yellow-500/30 bg-yellow-50'
        )}>
          {result.validation_summary.data_quality_status === 'Valid' ? (
            <CheckCircle className="h-4 w-4 text-green-600" />
          ) : (
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
          )}
          <AlertTitle className="text-[#3D2314]">
            Data Validation: {result.validation_summary.data_quality_status}
          </AlertTitle>
          <AlertDescription className="text-[#3D2314]/60">
            {result.validation_summary.total_brands_analyzed} brands analyzed.
            {result.validation_summary.issues_found?.length > 0
              ? ` ${result.validation_summary.issues_found.length} issues found.`
              : ' No issues detected.'}
          </AlertDescription>
        </Alert>
      )}

      {/* Tabbed Results */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="bg-[#3D2314]/5 border border-[#3D2314]/20">
          <TabsTrigger value="metrics" className="data-[state=active]:bg-[#3D2314] data-[state=active]:text-[#FFF8E7]">
            Metrics
          </TabsTrigger>
          <TabsTrigger value="trends" className="data-[state=active]:bg-[#3D2314] data-[state=active]:text-[#FFF8E7]">
            Trends
          </TabsTrigger>
          <TabsTrigger value="intelligence" className="data-[state=active]:bg-[#3D2314] data-[state=active]:text-[#FFF8E7]">
            Competitive Intel
          </TabsTrigger>
          <TabsTrigger value="recommendations" className="data-[state=active]:bg-[#3D2314] data-[state=active]:text-[#FFF8E7]">
            Recommendations
          </TabsTrigger>
        </TabsList>

        {/* Metrics Tab */}
        <TabsContent value="metrics" className="space-y-6">
          {/* Market Metrics Cards */}
          {result.market_metrics && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card className="border-[#3D2314]/20">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-[#3D2314]/60">Total Market Share</CardTitle>
                </CardHeader>
                <CardContent>
                  <span className="text-4xl font-bold text-[#3D2314]">{result.market_metrics.total_market_share}%</span>
                </CardContent>
              </Card>

              <Card className="border-[#3D2314]/20">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-[#3D2314]/60">Total Voice Share</CardTitle>
                </CardHeader>
                <CardContent>
                  <span className="text-4xl font-bold text-[#3D2314]">{result.market_metrics.total_voice_share}%</span>
                </CardContent>
              </Card>

              <Card className="border-[#3D2314]/20">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-[#3D2314]/60">Top Brand SOM</CardTitle>
                </CardHeader>
                <CardContent>
                  <span className="text-4xl font-bold text-[#3D2314]">{result.market_metrics.top_brand_som}%</span>
                </CardContent>
              </Card>

              <Card className="border-[#3D2314]/20">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-[#3D2314]/60">Top Brand SOV</CardTitle>
                </CardHeader>
                <CardContent>
                  <span className="text-4xl font-bold text-[#3D2314]">{result.market_metrics.top_brand_sov}%</span>
                </CardContent>
              </Card>

              <Card className="border-[#3D2314]/20 col-span-1 md:col-span-2">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-[#3D2314]/60">Efficiency Leader</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-3">
                    <Badge className="bg-[#D4A24C] text-white border-0 text-lg px-4 py-2">
                      {result.market_metrics.efficiency_leader}
                    </Badge>
                    <span className="text-sm text-[#3D2314]/60">Highest SOV/SOM ratio</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Market Share Visualization */}
          <Card className="border-[#3D2314]/20">
            <CardHeader>
              <CardTitle className="text-[#3D2314] flex items-center gap-2">
                <PieChart className="h-5 w-5 text-[#D4A24C]" />
                Market Share Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-48 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-6xl font-bold text-[#3D2314]">
                    {result.market_metrics?.total_market_share}%
                  </div>
                  <p className="text-sm text-[#3D2314]/60 mt-2">Total analyzed brands</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Trends Tab */}
        <TabsContent value="trends" className="space-y-6">
          <Card className="border-[#3D2314]/20">
            <CardHeader>
              <CardTitle className="text-[#3D2314] flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-[#D4A24C]" />
                Market Trends
              </CardTitle>
            </CardHeader>
            <CardContent>
              {result.competitive_insights?.market_trends && result.competitive_insights.market_trends.length > 0 ? (
                <div className="space-y-4">
                  {result.competitive_insights.market_trends.map((trend, i) => (
                    <div key={i} className="flex gap-3 p-4 rounded-lg bg-[#FFF8E7] border border-[#3D2314]/10">
                      <TrendingUp className="h-5 w-5 text-[#D4A24C] flex-shrink-0 mt-0.5" />
                      <p className="text-[#3D2314]">{trend}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-[#3D2314]/60">No trend data available</p>
              )}
            </CardContent>
          </Card>

          <Card className="border-[#3D2314]/20">
            <CardHeader>
              <CardTitle className="text-[#3D2314] flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-[#D4A24C]" />
                Period-over-Period Changes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 rounded bg-[#FFF8E7]">
                  <span className="text-[#3D2314]">Market Share Growth</span>
                  <Badge className="bg-green-500 text-white border-0">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    +7.14%
                  </Badge>
                </div>
                <div className="flex items-center justify-between p-3 rounded bg-[#FFF8E7]">
                  <span className="text-[#3D2314]">Voice Share Growth</span>
                  <Badge className="bg-green-500 text-white border-0">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    +5.2%
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Competitive Intelligence Tab */}
        <TabsContent value="intelligence" className="space-y-6">
          <Card className="border-[#3D2314]/20">
            <CardHeader>
              <CardTitle className="text-[#3D2314] flex items-center gap-2">
                <Target className="h-5 w-5 text-[#D4A24C]" />
                Competitor Activities
              </CardTitle>
            </CardHeader>
            <CardContent>
              {result.competitive_insights?.competitor_activities && result.competitive_insights.competitor_activities.length > 0 ? (
                <div className="space-y-4">
                  {result.competitive_insights.competitor_activities.map((activity, i) => (
                    <div key={i} className="p-4 rounded-lg border border-[#3D2314]/20 bg-white">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-medium text-[#3D2314]">{activity}</h4>
                        <Badge variant="outline" className="border-[#D4A24C] text-[#D4A24C]">
                          Active
                        </Badge>
                      </div>
                      <p className="text-sm text-[#3D2314]/60">Competitive activity detected in market</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-[#3D2314]/60">No competitor activity data available</p>
              )}
            </CardContent>
          </Card>

          <Card className="border-[#3D2314]/20">
            <CardHeader>
              <CardTitle className="text-[#3D2314] flex items-center gap-2">
                <FileText className="h-5 w-5 text-[#D4A24C]" />
                Industry Developments
              </CardTitle>
            </CardHeader>
            <CardContent>
              {result.competitive_insights?.industry_developments && result.competitive_insights.industry_developments.length > 0 ? (
                <div className="space-y-3">
                  {result.competitive_insights.industry_developments.map((dev, i) => (
                    <div key={i} className="flex gap-3 p-3 rounded bg-[#FFF8E7]">
                      <ChevronRight className="h-5 w-5 text-[#D4A24C] flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-[#3D2314]">{dev}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-[#3D2314]/60">No industry development data available</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Recommendations Tab */}
        <TabsContent value="recommendations" className="space-y-6">
          <Card className="border-[#3D2314]/20">
            <CardHeader>
              <CardTitle className="text-[#3D2314] flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-[#D4A24C]" />
                Priority Actions
              </CardTitle>
            </CardHeader>
            <CardContent>
              {result.strategic_recommendations?.priority_actions && result.strategic_recommendations.priority_actions.length > 0 ? (
                <div className="space-y-4">
                  {result.strategic_recommendations.priority_actions.map((action, i) => (
                    <div key={i} className="p-4 rounded-lg border-l-4 border-[#D4A24C] bg-[#FFF8E7]">
                      <div className="flex items-start gap-3">
                        <Badge className="bg-[#3D2314] text-[#FFF8E7] border-0 mt-0.5">
                          {i + 1}
                        </Badge>
                        <div className="flex-1">
                          <p className="text-[#3D2314] font-medium">{action}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-[#3D2314]/60">No priority actions available</p>
              )}
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="border-[#3D2314]/20">
              <CardHeader>
                <CardTitle className="text-[#3D2314] flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-red-500" />
                  Risk Areas
                </CardTitle>
              </CardHeader>
              <CardContent>
                {result.strategic_recommendations?.risk_areas && result.strategic_recommendations.risk_areas.length > 0 ? (
                  <ul className="space-y-2">
                    {result.strategic_recommendations.risk_areas.map((risk, i) => (
                      <li key={i} className="flex gap-2 text-sm text-[#3D2314]">
                        <span className="text-red-500 flex-shrink-0">•</span>
                        <span>{risk}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-[#3D2314]/60">No risks identified</p>
                )}
              </CardContent>
            </Card>

            <Card className="border-[#3D2314]/20">
              <CardHeader>
                <CardTitle className="text-[#3D2314] flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-green-500" />
                  Opportunity Areas
                </CardTitle>
              </CardHeader>
              <CardContent>
                {result.strategic_recommendations?.opportunity_areas && result.strategic_recommendations.opportunity_areas.length > 0 ? (
                  <ul className="space-y-2">
                    {result.strategic_recommendations.opportunity_areas.map((opp, i) => (
                      <li key={i} className="flex gap-2 text-sm text-[#3D2314]">
                        <span className="text-green-500 flex-shrink-0">•</span>
                        <span>{opp}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-[#3D2314]/60">No opportunities identified</p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

// =============================================================================
// History View
// =============================================================================
function HistoryView() {
  const [selectedEntries, setSelectedEntries] = useState<string[]>([])

  const toggleSelection = (id: string) => {
    setSelectedEntries(prev =>
      prev.includes(id)
        ? prev.filter(x => x !== id)
        : prev.length < 2
        ? [...prev, id]
        : prev
    )
  }

  return (
    <div className="p-8 space-y-8">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-3xl font-bold text-[#3D2314]">Analysis History</h2>
          <p className="text-[#3D2314]/60 mt-1">View and compare past analyses</p>
        </div>

        <Button
          variant="outline"
          disabled={selectedEntries.length !== 2}
          className="border-[#3D2314]/20 text-[#3D2314] hover:bg-[#3D2314]/10"
        >
          Compare Selected ({selectedEntries.length}/2)
        </Button>
      </div>

      {/* Filter Bar */}
      <Card className="border-[#3D2314]/20">
        <CardHeader>
          <CardTitle className="text-[#3D2314] text-sm">Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="date-from" className="text-[#3D2314]">Date From</Label>
              <Input
                id="date-from"
                type="date"
                className="mt-2 border-[#3D2314]/20 text-[#3D2314]"
              />
            </div>
            <div>
              <Label htmlFor="date-to" className="text-[#3D2314]">Date To</Label>
              <Input
                id="date-to"
                type="date"
                className="mt-2 border-[#3D2314]/20 text-[#3D2314]"
              />
            </div>
            <div>
              <Label htmlFor="brand-filter" className="text-[#3D2314]">Brand</Label>
              <Input
                id="brand-filter"
                placeholder="Filter by brand..."
                className="mt-2 border-[#3D2314]/20 text-[#3D2314]"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* History Table */}
      <Card className="border-[#3D2314]/20">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-[#3D2314]/20">
                <TableHead className="text-[#3D2314]/60 w-12"></TableHead>
                <TableHead className="text-[#3D2314]/60">Date</TableHead>
                <TableHead className="text-[#3D2314]/60">Period</TableHead>
                <TableHead className="text-[#3D2314]/60">Brands</TableHead>
                <TableHead className="text-[#3D2314]/60">Status</TableHead>
                <TableHead className="text-[#3D2314]/60">Key Finding</TableHead>
                <TableHead className="text-[#3D2314]/60">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockHistory.map((entry) => (
                <TableRow
                  key={entry.id}
                  className={cn(
                    'border-[#3D2314]/20 cursor-pointer hover:bg-[#FFF8E7]',
                    selectedEntries.includes(entry.id) && 'bg-[#D4A24C]/10'
                  )}
                  onClick={() => toggleSelection(entry.id)}
                >
                  <TableCell>
                    <div className={cn(
                      'w-4 h-4 border-2 rounded',
                      selectedEntries.includes(entry.id)
                        ? 'bg-[#3D2314] border-[#3D2314]'
                        : 'border-[#3D2314]/20'
                    )} />
                  </TableCell>
                  <TableCell className="text-[#3D2314] flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-[#D4A24C]" />
                    {entry.date}
                  </TableCell>
                  <TableCell className="text-[#3D2314]">{entry.period}</TableCell>
                  <TableCell className="text-[#3D2314]">{entry.brands}</TableCell>
                  <TableCell>
                    <Badge
                      className={cn(
                        'border-0',
                        entry.status === 'success'
                          ? 'bg-green-500 text-white'
                          : 'bg-red-500 text-white'
                      )}
                    >
                      {entry.status === 'success' ? (
                        <>
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Success
                        </>
                      ) : (
                        <>
                          <AlertCircle className="h-3 w-3 mr-1" />
                          Error
                        </>
                      )}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-[#3D2314] text-sm max-w-md truncate">
                    {entry.keyFinding}
                  </TableCell>
                  <TableCell>
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-[#3D2314]/20 text-[#3D2314] hover:bg-[#3D2314]/10"
                      onClick={(e) => {
                        e.stopPropagation()
                      }}
                    >
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

// =============================================================================
// Settings View
// =============================================================================
function SettingsView() {
  return (
    <div className="p-8 space-y-8">
      <div>
        <h2 className="text-3xl font-bold text-[#3D2314]">Settings</h2>
        <p className="text-[#3D2314]/60 mt-1">Configure your analysis preferences</p>
      </div>

      <Card className="border-[#3D2314]/20">
        <CardHeader>
          <CardTitle className="text-[#3D2314]">Analysis Configuration</CardTitle>
          <CardDescription className="text-[#3D2314]/60">
            Default settings for market analysis
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <Label htmlFor="default-period" className="text-[#3D2314]">Default Analysis Period</Label>
            <Input
              id="default-period"
              placeholder="e.g., Monthly"
              className="mt-2 border-[#3D2314]/20 text-[#3D2314]"
            />
          </div>

          <div>
            <Label htmlFor="market-name" className="text-[#3D2314]">Market Name</Label>
            <Input
              id="market-name"
              defaultValue="Chocolate Snacking Market"
              className="mt-2 border-[#3D2314]/20 text-[#3D2314]"
            />
          </div>

          <Separator className="bg-[#3D2314]/20" />

          <div>
            <h3 className="text-sm font-medium text-[#3D2314] mb-2">Notification Preferences</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="notify-complete" className="text-[#3D2314] font-normal">
                  Notify when analysis completes
                </Label>
                <input
                  id="notify-complete"
                  type="checkbox"
                  className="h-4 w-4 rounded border-[#3D2314]/20"
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="notify-alerts" className="text-[#3D2314] font-normal">
                  Send alerts for significant changes
                </Label>
                <input
                  id="notify-alerts"
                  type="checkbox"
                  className="h-4 w-4 rounded border-[#3D2314]/20"
                />
              </div>
            </div>
          </div>

          <Button className="bg-[#3D2314] hover:bg-[#3D2314]/90 text-[#FFF8E7]">
            Save Settings
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

// =============================================================================
// Main App Component
// =============================================================================
export default function Home() {
  const [activeView, setActiveView] = useState('dashboard')
  const [analysisResults, setAnalysisResults] = useState<NormalizedAgentResponse | null>(null)

  const handleAnalysisComplete = useCallback((response: NormalizedAgentResponse) => {
    setAnalysisResults(response)
    setActiveView('results')
  }, [])

  return (
    <div className="min-h-screen bg-[#FFF8E7] flex">
      <Sidebar activeView={activeView} onNavigate={setActiveView} />

      <main className="flex-1 overflow-y-auto">
        {activeView === 'dashboard' && <DashboardView onNavigate={setActiveView} />}
        {activeView === 'analysis' && <AnalysisView onAnalysisComplete={handleAnalysisComplete} />}
        {activeView === 'results' && <ResultsView analysisData={analysisResults} onNavigate={setActiveView} />}
        {activeView === 'history' && <HistoryView />}
        {activeView === 'settings' && <SettingsView />}
      </main>
    </div>
  )
}
