import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-result',
  templateUrl: './result.html',
  styleUrls: ['./result.scss'],
  standalone: true,
  imports: [CommonModule], 
})
export class Result implements OnInit {
  // values coming from navigation state (Home component)
  totalScore: number = 0;
  maxScore: number = 42; // 7 questions * 6 points
  percentage: number = 0; // rounded percent
  stageLabel: string = '';
  stageMessage: string = '';
  statusLabel: 'PASS' | 'FAIL' = 'FAIL';
  radialBackground: string = ''; // will contain conic-gradient string
  businessChallenge: string = '';

  // pills shown on the card (visual)
  pills: Array<{ text: string; class?: string }> = [];

  constructor(private router: Router) {}

  ngOnInit(): void {
    // Read passed state (Home navigated with router.navigate(['/results'], { state: {...} }))
    const st = (history && history.state) ? history.state : {};
    
    // Use values directly from home.ts - no recalculation needed
    this.totalScore = Number(st.totalScore ?? 0);
    this.maxScore = Number(st.maxScore ?? 42);
    this.percentage = st.percentage ?? Math.round((this.totalScore / this.maxScore) * 100);
    this.businessChallenge = st.businessChallenge ?? '';
    this.stageLabel = st.stage ?? this.mapStageLabel(this.totalScore);

    // set stage message using the stageLabel
    this.stageMessage = this.mapStageMessage(this.stageLabel);

    // status: treat Growth and Industry Leader as PASS; others as FAIL
    this.statusLabel = (this.stageLabel === 'Growth Stage' || this.stageLabel === 'Industry Leader Stage') ? 'PASS' : 'FAIL';

    // build pills based on stage (visual guidance)
    this.buildPills(this.stageLabel);

    // compute radial background (conic-gradient string)
    this.radialBackground = this.makeRadialBackground(this.percentage);
  }

  private mapStageLabel(score: number): string {
    if (score <= 15) return 'At Risk Stage';
    if (score <= 30) return 'Stabilizing Stage';
    if (score <= 42) return 'Growth Stage';
    return 'Industry Leader Stage';
  }

  // set the detailed stage message based on stage label
  private mapStageMessage(stage: string): string {
    switch(stage) {
      case 'At Risk Stage':
        return 'Compliance, onboarding, and operations are holding you back. Immediate automation & data governance can reduce risk.';
      case 'Stabilizing Stage':
        return 'You\'ve started leveraging Salesforce but gaps in integration, SLA management, and cost control remain.';
      case 'Growth Stage':
        return 'You\'re building maturity. Next focus: AI insights, stronger 360 views, and fraud detection.';
      case 'Industry Leader Stage':
        return 'You\'re ahead of peers. The next leap is predictive analytics, embedded compliance, and hyper-personalization.';
      default:
        return 'Assessment complete. Review your results and next steps.';
    }
  }

  private buildPills(stage: string) {
    if (stage === 'At Risk Stage') {
      this.pills = [
        { text: 'Optimization Needed', class: 'pill-ghost' },
        { text: 'Immediate Action', class: '' },
        { text: 'Data Governance', class: '' }
      ];
    } else if (stage === 'Stabilizing Stage') {
      this.pills = [
        { text: 'Stabilizing', class: 'pill-secondary' },
        { text: 'Integration Gaps', class: '' },
        { text: 'SLA Focus', class: '' }
      ];
    } else if (stage === 'Growth Stage') {
      this.pills = [
        { text: 'Growth Potential', class: 'pill-success' },
        { text: 'AI Ready', class: '' },
        { text: '360 View', class: '' }
      ];
    } else {
      this.pills = [
        { text: 'Industry Leader', class: 'pill-success' },
        { text: 'Predictive Analytics', class: '' },
        { text: 'Hyper-personalization', class: '' }
      ];
    }
  }

  // produces the conic-gradient background CSS for the given percent (0..100)
  private makeRadialBackground(percent: number): string {
    // clamp
    const p = Math.max(0, Math.min(100, Math.round(percent)));
    const angle = (p / 100) * 360;
    
    // Use green for non-At Risk stages, red for At Risk stage
    const isAtRisk = this.stageLabel === 'At Risk Stage';
    const accent = isAtRisk ? '#d82828' : '#28a745'; // red for At Risk, green for others
    const accentLight = isAtRisk ? '#ffd7d7' : '#d4edda'; // light red for At Risk, light green for others
    
    return `conic-gradient(${accent} 0deg, ${accent} ${angle}deg, ${accentLight} ${angle}deg, ${accentLight} 360deg)`;
  }

  // nav actions
  contactExperts() {
    // send to contact or open contact form — placeholder for your integration
    console.log('contactExperts clicked');
    // example: this.router.navigate(['/contact']);
  }

  toggleMenu() {
    // kept for parity with header
    console.log('menu toggled');
  }
}