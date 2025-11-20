# Post-Redemption Survey Feature

## Overview
Optional survey shown after users claim a reward. Completing it grants +1 bonus door.

---

## User Flow

1. User wins a prize, gets QR code
2. User scans QR code at business
3. **NEW:** Modal appears: "Answer 4 quick questions for a bonus door!"
4. User completes survey (30 seconds)
5. User receives +1 door immediately
6. Business gets valuable data

---

## Survey Questions

### Question 1: Purchase Behavior
**"Did you make any other purchases with your free [item]?"**

Options:
- [ ] Yes → Show Q2
- [ ] No, just the free item → Skip to Q3

### Question 2: Spend Amount (Conditional)
**"About how much did you spend?"**

Options:
- [ ] Under $5
- [ ] $5-$10
- [ ] $10-$20
- [ ] Over $20

### Question 3: Return Intent
**"Will you visit [Business Name] again?"**

Options:
- [ ] Yes, definitely
- [ ] Maybe
- [ ] Probably not

### Question 4: Discovery (Optional)
**"How did you first learn about [Business Name]?"**

Options:
- [ ] Already knew about it
- [ ] Found through OpenDoors
- [ ] Friend/family recommended
- [ ] Other

---

## Database Schema

### New Table: `redemption_surveys`

```sql
CREATE TABLE public.redemption_surveys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reward_id UUID NOT NULL REFERENCES user_rewards(id) ON DELETE CASCADE,
  prize_id UUID NOT NULL REFERENCES prizes(id),

  -- Survey Responses
  made_purchase BOOLEAN NOT NULL,
  spend_amount TEXT, -- 'under_5', '5_10', '10_20', 'over_20', NULL if no purchase
  will_return TEXT NOT NULL, -- 'yes', 'maybe', 'no'
  discovery_source TEXT, -- 'existing', 'opendoors', 'referral', 'other'

  -- Reward Tracking
  bonus_door_granted BOOLEAN DEFAULT false,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_redemption_surveys_user_id ON public.redemption_surveys(user_id);
CREATE INDEX idx_redemption_surveys_prize_id ON public.redemption_surveys(prize_id);
CREATE INDEX idx_redemption_surveys_created_at ON public.redemption_surveys(created_at DESC);

-- RLS
ALTER TABLE public.redemption_surveys ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read their own surveys"
  ON public.redemption_surveys FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own surveys"
  ON public.redemption_surveys FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Grant permissions
GRANT SELECT, INSERT ON public.redemption_surveys TO authenticated;
```

---

## Business Analytics Queries

### Average Ticket Size per Business
```sql
SELECT
  p.id as prize_id,
  p.name as prize_name,
  COUNT(*) as total_responses,

  -- Purchase rate
  SUM(CASE WHEN made_purchase THEN 1 ELSE 0 END) * 100.0 / COUNT(*) as purchase_rate_pct,

  -- Average spend (estimated midpoint)
  AVG(
    CASE spend_amount
      WHEN 'under_5' THEN 2.5
      WHEN '5_10' THEN 7.5
      WHEN '10_20' THEN 15
      WHEN 'over_20' THEN 25
      ELSE 0
    END
  ) as avg_spend_estimate,

  -- Return intent
  SUM(CASE WHEN will_return = 'yes' THEN 1 ELSE 0 END) * 100.0 / COUNT(*) as will_return_pct

FROM redemption_surveys rs
JOIN prizes p ON rs.prize_id = p.id
GROUP BY p.id, p.name
ORDER BY total_responses DESC;
```

### New Customer Acquisition
```sql
SELECT
  p.name as prize_name,
  COUNT(*) as total_redemptions,
  SUM(CASE WHEN discovery_source = 'opendoors' THEN 1 ELSE 0 END) as new_customers,
  SUM(CASE WHEN discovery_source = 'opendoors' THEN 1 ELSE 0 END) * 100.0 / COUNT(*) as new_customer_pct
FROM redemption_surveys rs
JOIN prizes p ON rs.prize_id = p.id
GROUP BY p.name;
```

### ROI Calculator for Businesses
```sql
-- For a specific prize/business
WITH survey_data AS (
  SELECT
    COUNT(*) as total_surveys,
    AVG(
      CASE spend_amount
        WHEN 'under_5' THEN 2.5
        WHEN '5_10' THEN 7.5
        WHEN '10_20' THEN 15
        WHEN 'over_20' THEN 25
        ELSE 0
      END
    ) as avg_ticket_size,
    SUM(CASE WHEN made_purchase THEN 1 ELSE 0 END) as purchases_made
  FROM redemption_surveys
  WHERE prize_id = $1 -- specific prize
)
SELECT
  total_surveys as redemptions,
  purchases_made,
  (purchases_made * 100.0 / total_surveys) as conversion_rate_pct,
  avg_ticket_size as avg_spend,
  (purchases_made * avg_ticket_size) as total_revenue_generated,

  -- Assuming prize cost = $2 (adjust per business)
  (purchases_made * avg_ticket_size) - (total_surveys * 2) as estimated_profit
FROM survey_data;
```

---

## UI/UX Specifications

### Modal Design
- **Trigger:** Automatically appears after QR code is scanned (or after "Mark as Claimed" button)
- **Dismissible:** Yes, with "Skip" button (no bonus door)
- **Progress Indicator:** "Question 1 of 4"
- **Completion:** Show confetti + "+1 DOOR" animation

### Component Location
- Create new modal: `src/components/modals/RedemptionSurveyModal.tsx`
- Trigger from: `src/screens/main/RewardsScreen.tsx` (after claiming)

### Example Copy
**Title:** "Quick Survey = Bonus Door!"
**Subtitle:** "Help us improve and get +1 free door (30 seconds)"

---

## Analytics Dashboard (Future)

### Business-Facing Metrics
Show businesses (via admin dashboard):

1. **Redemption Rate:** 65% of winners claimed
2. **Purchase Rate:** 78% made additional purchases
3. **Average Ticket Size:** $12.50
4. **Estimated Revenue Generated:** $1,250 (100 redemptions × $12.50)
5. **Cost to Business:** $200 (100 × $2 free item cost)
6. **Net Gain:** $1,050
7. **Customer Acquisition Cost:** $2.00 per customer
8. **Return Intent:** 85% will visit again

### Your Metrics (Platform)
1. Survey completion rate
2. Average ticket size across all businesses
3. Best-performing prize types
4. Customer acquisition vs. existing customer retention

---

## Implementation Priority

### Phase 1: MVP (This Week)
- [x] Create `redemption_surveys` table
- [ ] Build `RedemptionSurveyModal.tsx` component
- [ ] Integrate with rewards claiming flow
- [ ] Grant +1 door on completion

### Phase 2: Analytics (Next Week)
- [ ] Create business analytics queries
- [ ] Build simple admin dashboard to view results
- [ ] Add export to CSV for sharing with businesses

### Phase 3: Optimization (Future)
- [ ] A/B test different survey questions
- [ ] Add skip tracking (how many users skip survey)
- [ ] Make survey questions configurable per business
- [ ] Add photo upload option (receipt proof)

---

## Privacy & Compliance

- ✅ No PII collected
- ✅ Users opt-in (can skip)
- ✅ Data used for business analytics only
- ✅ COPPA compliant (no sensitive data)
- ✅ Can be anonymized for business reporting

---

## Success Metrics

**User Engagement:**
- Target: 60%+ survey completion rate
- Incentive: +1 door is valuable enough

**Business Value:**
- Prove average ticket size is 3-5x the free item cost
- Show 70%+ return intent
- Demonstrate 50%+ are new customers

**Platform Value:**
- Collect 1000+ survey responses in first month
- Use data to pitch new businesses
- Create compelling ROI case studies

---

## Sample Business Pitch (Using Survey Data)

> "Last month, 150 users redeemed your free pastry. Here's what happened:
> - **82% made additional purchases** (coffee, lunch, etc.)
> - **Average ticket: $11.50** per redemption
> - **Total revenue: $1,380** generated
> - **Your cost: $300** (150 pastries × $2 each)
> - **Net profit: $1,080** from OpenDoors
> - **Cost per customer: $2.00** (vs $25-50 on Facebook ads)
> - **90% said they'd return** - built loyalty for life"

This turns your app from "fun game" to "ROI-generating marketing tool."

---

**Priority:** High - This feature makes your business pitch 10x stronger.
