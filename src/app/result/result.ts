import { Component, OnInit, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

type MessageSection =
  | { kind: 'paragraph'; text: string }
  | { kind: 'heading'; text: string }
  | { kind: 'list'; items: string[] };

@Component({
  selector: 'app-result',
  templateUrl: './result.html',
  styleUrls: ['./result.scss'],
  standalone: true,
  imports: [CommonModule],
})
export class Result implements OnInit, AfterViewInit {
  // score values
  totalScore: number = 0;
  maxScore: number = 42;
  percentage: number = 0;
  stageLabel: string = '';
  stageMessage: string = '';
  statusLabel: string = 'FAIL';
  radialBackground: string = '';
  businessChallenge: string = '';

  // structured stage data (Status | Points | Stage | Message) - copied from DOCX
  stageData: Record<string, { status: string; points: string; stage: string; message: string }> = {
    'At Risk': {
      status: 'FAIL',
      points: '0–15',
      stage: 'At Risk',
      message: `Compliance, onboarding, and operations are holding you back.
Immediate focus should be on automation and data governance.
Use Salesforce Flow to automate onboarding & KYC processes.
Strengthen compliance with Salesforce Shield (encryption, audit trails, event monitoring).
Unify customer data with Data Cloud for regulatory alignment.`,
    },
    'Stabilizing': {
      status: 'Needs Improvement',
      points: '16–30',
      stage: 'Stabilizing',
      message: `You’ve started leveraging Salesforce but gaps in integration, SLA management, and cost control remain.
Next steps:
Implement MuleSoft to connect siloed core banking, claims, and investment systems.
Use Service Cloud SLAs & Milestones to improve case resolution tracking.
Control spend with AMS optimization dashboards in Tableau.`,
    },
    'Growth': {
      status: 'PASS',
      points: '31–42',
      stage: 'Growth',
      message: `You’re building maturity.
Next focus areas:
Deploy Einstein GPT for predictive insights and automated case summaries.
Enhance customer visibility with Financial Services Cloud 360° profiles.
Strengthen fraud prevention using Tableau + AI models.`,
    },
    'Industry Leader Stage': {
      status: 'PASS WITH EXCELLENCE',
      points: '43+',
      stage: 'Industry Leader Stage',
      message: `You’re ahead of peers.
The next leap is innovation-led growth:
Adopt Agentforce for AI-powered autonomous service agents.
Scale predictive analytics with Einstein AI + Tableau.
Deliver hyper-personalized experiences using Marketing Cloud Personalization.
Maintain trust with embedded compliance monitoring in Financial Services Cloud.`,
    },
  };

  // parsed message sections for the current stage (paragraphs / lists)
  parsedSections: MessageSection[] = [];

  // pills shown on the card (visual)
  pills: Array<{ text: string; class?: string }> = [];

  constructor(private router: Router) {}

  ngOnInit(): void {
    const st = (history && history.state) ? history.state : {};

    this.totalScore = Number(st.totalScore ?? 0);
    this.maxScore = Number(st.maxScore ?? 42);

    const rawPct = this.maxScore > 0 ? (this.totalScore / this.maxScore) * 100 : 0;
    this.percentage = Math.max(0, Math.min(100, Math.round(rawPct)));

    this.businessChallenge = st.businessChallenge ?? '';

    // stageLabel may come with or without " Stage" suffix from other parts of the app
    this.stageLabel = st.stage ?? this.mapStageLabel(this.totalScore);
    this.stageMessage = this.mapStageMessage(this.stageLabel);
    this.statusLabel = this.mapStatusLabel(this.totalScore);

    // set radial gradient
    this.radialBackground = this.makeRadialBackground(this.percentage);

    // build pills for UI
    this.buildPills(this.stageLabel);

    // compute parsedSections using resolved entry (falls back to short message)
    const entry = this.getStageEntry();
    const rawMessage = entry ? entry.message : this.stageMessage;
    this.parsedSections = this.parseMessage(rawMessage);
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
    }, 0);
  }

  // -----------------------
  // Helper: resolve stage entry robustly
  // -----------------------
  private getStageEntry():
    | { status: string; points: string; stage: string; message: string }
    | null {
    // direct key hit
    if (this.stageData[this.stageLabel]) {
      return this.stageData[this.stageLabel];
    }

    // try matching by .stage property (allow "Stabilizing" or "Stabilizing Stage" etc.)
    const normalized = (s: string) => s.replace(/\s+Stage$/i, '').trim().toLowerCase();
    const wanted = normalized(this.stageLabel);

    const found = Object.values(this.stageData).find((e) => normalized(e.stage) === wanted);
    return found ?? null;
  }

  // Template-friendly getters (use these in the template)
  getStageStatus(): string {
    const e = this.getStageEntry();
    return e ? e.status : this.statusLabel;
  }

  getStagePoints(): string {
    const e = this.getStageEntry();
    return e ? e.points : '-';
  }

  getStageStage(): string {
    const e = this.getStageEntry();
    return e ? e.stage : this.stageLabel;
  }

  // -----------------------
  // Existing logic
  // -----------------------
  getStageLabelColorClass(): string {
    return this.stageLabel === 'At Risk' ? 'at-risk' : '';
  }

  private mapStageLabel(score: number): string {
    if (score > 42) return 'Industry Leader Stage';
    if (score <= 15) return 'At Risk';
    if (score <= 30) return 'Stabilizing';
    if (score <= 42) return 'Growth';
    return 'Industry Leader Stage';
  }

  private mapStatusLabel(score: number): string {
    if (score <= 15) return 'FAIL';
    if (score <= 30) return 'Needs Improvement';
    if (score <= 42) return 'PASS';
    return 'PASS WITH EXCELLENCE';
  }

  private mapStageMessage(stage: string): string {
    switch (stage) {
      case 'At Risk':
        return 'Compliance, onboarding, and operations are holding you back. Immediate automation & data governance can reduce risk.';
      case 'Stabilizing':
        return "You've started leveraging Salesforce but gaps in integration, SLA management, and cost control remain.";
      case 'Growth':
        return "You're building maturity. Next focus: AI insights, stronger 360 views, and fraud detection.";
      case 'Industry Leader Stage':
        return "You're ahead of peers. The next leap is predictive analytics, embedded compliance, and hyper-personalization.";
      default:
        return 'Assessment complete. Review your results and next steps.';
    }
  }

  private buildPills(stage: string) {
    if (stage === 'At Risk') {
      this.pills = [
        { text: 'Optimization Needed', class: 'pill-ghost' },
        { text: 'Immediate Action', class: '' },
        { text: 'Data Governance', class: '' },
      ];
    } else if (stage === 'Stabilizing') {
      this.pills = [
        { text: 'Stabilizing', class: 'pill-secondary' },
        { text: 'Integration Gaps', class: '' },
        { text: 'SLA Focus', class: '' },
      ];
    } else if (stage === 'Growth') {
      this.pills = [
        { text: 'Growth Potential', class: 'pill-success' },
        { text: 'AI Ready', class: '' },
        { text: '360 View', class: '' },
      ];
    } else {
      this.pills = [
        { text: 'Industry Leader', class: 'pill-success' },
        { text: 'Predictive Analytics', class: '' },
        { text: 'Hyper-personalization', class: '' },
      ];
    }
  }

  private makeRadialBackground(percent: number): string {
    const p = Math.max(0, Math.min(100, Math.round(percent)));
    const angle = (p / 100) * 360;
    const isAtRisk = this.stageLabel === 'At Risk';
    const accent = isAtRisk ? '#d82828' : '#28a745';
    const accentLight = isAtRisk ? '#ffd7d7' : '#d4edda';
    if (p === 100) {
      return `conic-gradient(${accent} 0deg, ${accent} 360deg)`;
    }
    return `conic-gradient(${accent} 0deg, ${accent} ${angle}deg, ${accentLight} ${angle}deg, ${accentLight} 360deg)`;
  }

  // parse raw message into sections (paragraphs / headings / lists)
  private parseMessage(raw: string): MessageSection[] {
    if (!raw) return [];

    const text = raw.replace(/\r\n/g, '\n').trim();
    const blocks = text.split(/\n{2,}/).map(b => b.trim()).filter(Boolean);
    const sections: MessageSection[] = [];

    for (const block of blocks) {
      const lines = block.split('\n').map(l => l.trim()).filter(Boolean);
      const first = lines[0] ?? '';
      const isHeader = /^(Next steps:|Next focus areas:|The next leap is:|The next leap is|Next steps)$/i.test(first);
      const anyBullet = lines.some(l => /^[\u2022\-•]\s*/.test(l));

      if (isHeader && lines.length > 1) {
        sections.push({ kind: 'heading', text: first.replace(/:$/, '') });
        const rest = lines.slice(1);
        if (rest.some(l => /^[\u2022\-•]/.test(l))) {
          const items = rest.map(l => l.replace(/^[\u2022\-•]\s*/, '').trim()).filter(Boolean);
          sections.push({ kind: 'list', items });
        } else {
          if (rest.length > 1) {
            const items = rest.map(l => l.trim()).filter(Boolean);
            sections.push({ kind: 'list', items });
          } else {
            sections.push({ kind: 'paragraph', text: rest.join(' ') });
          }
        }
        continue;
      }

      if (anyBullet) {
        const items = lines.map(l => l.replace(/^[\u2022\-•]\s*/, '').trim()).filter(Boolean);
        sections.push({ kind: 'list', items });
        continue;
      }

      if (lines.length > 1 && lines.every(l => l.length < 120 && /^[A-Z0-9]/i.test(l))) {
        const items = lines.slice();
        sections.push({ kind: 'list', items });
        continue;
      }

      sections.push({ kind: 'paragraph', text: lines.join(' ') });
    }

    return sections;
  }

  contactExperts() { console.log('contactExperts clicked'); }
  toggleMenu() { console.log('menu toggled'); }
}
