import { Component, AfterViewInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: './home.html',
  styleUrls: ['./home.scss'],
})
export class Home implements AfterViewInit {
  // Mapping of each radio value to points (0,2,4,6)
  private scoreMapping: { [value: string]: number } = {
    // Q1 - Customer Onboarding & KYC
    manual_delays: 0,
    semi_automated: 2,
    mostly_automated: 4, // Fixed: was "mostly_compliant"
    fully_automated: 6,

    // Q2 - Data Accuracy & Compliance
    frequent_errors: 0, // Fixed: was "manual_slow"
    manual_checks: 2, // Fixed: was "basic_workflow"
    mostly_compliant: 4, // Fixed: was "automated_tracking"
    strong_governance: 6, // Fixed: was "ai_powered"

    // Q3 - Integration with Core Banking/Insurance Systems
    manual_exports: 0, // Fixed: was "inconsistent_data"
    limited_integration: 2, // Fixed: was "basic_validation"
    functional_integration: 4, // Fixed: was "regular_cleansing"
    seamless_realtime: 6, // Fixed: was "real_time_quality"

    // Q4 - Case/Claims Management
    high_backlog: 0, // Fixed: was "generic_communication"
    frequent_escalations: 2, // Fixed: was "basic_segmentation"
    majority_sla: 4, // Fixed: was "dynamic_personalization"
    fast_automated: 6, // Fixed: was "ai_driven_insights"

    // Q5 - Customer 360 & Personalization
    fragmented_view: 0, // Fixed: was "manual_reporting"
    partial_view: 2, // Fixed: was "basic_compliance"
    good_customer360: 4, // Fixed: was "automated_reporting"
    ai_driven_personalization: 6, // Fixed: was "comprehensive_governance"

    // Q6 - Cost & Operational Efficiency
    high_cost_unclear_roi: 0, // Fixed: was "siloed_systems"
    expensive_customizations: 2, // Fixed: was "basic_integration"
    balanced_resource_heavy: 4, // Fixed: was "seamless_integration"
    streamlined_automation: 6, // Fixed: was "unified_platform"

    // Q7 - Fraud Detection & Risk Management
    very_limited_manual: 0, // Fixed: was "basic_reports"
    some_rules_not_realtime: 2, // Fixed: was "standard_dashboards"
    automated_alerts: 4, // Fixed: was "advanced_analytics"
    advanced_realtime_fraud: 6, // Fixed: was "ai_powered_insights"
  };

  // names of required questions in the DOM
  private requiredQuestions = [
    'question1',
    'question2',
    'question3',
    'question4',
    'question5',
    'question6',
    'question7',
  ];

  constructor(private router: Router) {}

  ngAfterViewInit(): void {
    // Set up character count for the optional textarea
    const textarea = document.getElementById(
      'business_challenge'
    ) as HTMLTextAreaElement | null;
    const countTextEl = document.querySelector(
      '.count-text'
    ) as HTMLElement | null;

    if (textarea && countTextEl) {
      const updateCount = () => {
        const len = textarea.value.length;
        countTextEl.textContent = `${len}/500`;
        countTextEl.classList.remove('near-limit', 'at-limit');

        if (len >= 450 && len < 500) {
          countTextEl.classList.add('near-limit');
        } else if (len >= 500) {
          countTextEl.classList.add('at-limit');
        }
      };

      textarea.addEventListener('input', updateCount);
      updateCount();
    }

    // Set up modal close functionality
    this.setupModalEvents();
  }

  // Add this new method
  private setupModalEvents(): void {
    const modalOverlay = document.getElementById('incompleteModal');
    const closeButton = document.getElementById('closeModal');

    if (closeButton && modalOverlay) {
      closeButton.addEventListener('click', () => {
        this.hideModal();
      });

      // Close modal when clicking outside
      modalOverlay.addEventListener('click', (event) => {
        if (event.target === modalOverlay) {
          this.hideModal();
        }
      });

      // Close modal with Escape key
      document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && modalOverlay.classList.contains('show')) {
          this.hideModal();
        }
      });
    }
  }

  // Add this new method
  private showModal(): void {
    const modal = document.getElementById('incompleteModal');
    if (modal) {
      modal.style.display = 'flex';
      // Small delay to ensure display is applied before adding show class
      setTimeout(() => {
        modal.classList.add('show');
      }, 10);
    }
  }

  // Add this new method
  private hideModal(): void {
    const modal = document.getElementById('incompleteModal');
    if (modal) {
      modal.classList.remove('show');
      // Wait for animation to complete before hiding
      setTimeout(() => {
        modal.style.display = 'none';
      }, 300);
    }
  }

  // returns selected radio value for question name, or null
  private getSelectedValue(questionName: string): string | null {
    const sel = document.querySelector(
      `input[name="${questionName}"]:checked`
    ) as HTMLInputElement | null;
    return sel ? sel.value : null;
  }

  // compute score across required questions; if any required unanswered -> valid=false
  private computeScore(): {
    valid: boolean;
    score: number;
    answers: Record<string, string>;
  } {
    let total = 0;
    const answers: Record<string, string> = {};

    for (const q of this.requiredQuestions) {
      const val = this.getSelectedValue(q);
      if (!val) {
        return { valid: false, score: 0, answers };
      }
      answers[q] = val;
      const pts = this.scoreMapping[val];
      total += typeof pts === 'number' ? pts : 0;
    }

    return { valid: true, score: total, answers };
  }

  // map numeric score to stage label (ranges based on 7 questions, 0-42)
  private getStage(score: number): string {
    if (score <= 15) return 'At Risk Stage';
    if (score <= 30) return 'Stabilizing Stage';
    if (score <= 42) return 'Growth Stage';
    return 'Industry Leader Stage';
  }

  // Called by the HTML button (click)
  onSubmit(): void {
  const result = this.computeScore();

  if (!result.valid) {
    // Show modal instead of alert
    this.showModal();
    return;
  }

  const totalScore = result.score;
  const maxScore = 7 * 6; // 42
  const percentage = Math.round((totalScore / maxScore) * 100);
  const stage = this.getStage(totalScore);

  const businessChallenge = (document.getElementById('business_challenge') as HTMLTextAreaElement | null)?.value || '';

  // Navigate to /results and pass state (history.state inside results)
  console.log(totalScore);
  this.router.navigate(['/results'], {
    state: {
      totalScore,
      maxScore,
      percentage,
      stage,
      answers: result.answers,
      businessChallenge
    }
  });
}
}
