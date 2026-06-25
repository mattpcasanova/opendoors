# OpenDoors — School Pilot Report

## At a glance

| | |
|---|---|
| Students who signed up | **151** |
| Students who played at least one game | **91 (60%)** |
| Total games played | **1,130** |
| Games won | **371 (32.8% win rate)** |
| Average games per active player | **12.4** (max: 79 by one student) |
| Total doors earned (all sources) | **863** |
| Doors actually used to play | **766 (88.8%)** |
| Onboarding surveys completed | **114 of 151 (75.5%)** |
| Referrals made | **59** |
| Referred students who played their first game | **49 of 59 (83%)** |

## Reward claim rate

**Students claimed 766 of the 863 rewards they earned — an 88.8% claim rate.** When students earn a reward (a door from watching an ad, completing a survey, referring a friend, or being given one by a distributor), they almost always use it. Rewards rarely go to waste.

## What students did

Of the 151 students who signed up, **91 (60%) played at least one game**. Those 91 students played **1,130 games total** — an average of about 12 games per active player. The most engaged student played 79 games.

The overall win rate was **32.8%** — students won 371 prizes across 1,130 games.

Doors (chances to play) come from four sources. The "used rate" shows how often students actually spent the doors instead of letting them expire:

| How students earned doors | Doors granted | Doors used | % used |
|---|---|---|---|
| Watching an ad | 533 | 503 | **94.4%** |
| Referring a friend (or being referred) | 103 | 89 | **86.4%** |
| Completing the post-game survey | 69 | 53 | **76.8%** |
| Distributor gave them out | 158 | 121 | **76.6%** |

Ad-watching doors get used almost every time. Distributed doors get used less often — meaning some students are getting handed doors that sit unspent.

## What prizes students won

| Prize | Won |
|---|---|
| Crumbl Free Cookie | 86 |
| Free Tadpole Mini | 68 |
| Free Medium Fries | 59 |
| Free Milkshake or Frosted Lemonade | 46 |
| Free Dessert | 45 |
| Free Drink Upgrade | 17 |
| $25 Gift Card | 11 |
| Free Side of Guac / Extra Protein | 10 |
| (10+ others) | 29 |

**78% of all wins were food prizes** (288 of 371), with another 18% in coffee/drinks. Entertainment and retail prizes were rarely won — partly because students chose to play for them far less often.

## The referral system worked

**49 of 59 students who received a referral (83%) went on to play their first game.** That's a much higher activation rate than the 60% across all signups, which means *referred students engage faster than students who find OpenDoors on their own*. Word-of-mouth growth is the most effective channel here.

## Onboarding survey responses

Of the 114 students who completed the survey, when asked what kind of game they wanted:

| Preference | Students | % |
|---|---|---|
| Something in the middle | 77 | 68% |
| Safer bets with smaller rewards | 22 | 19% |
| High-risk / high-reward | 15 | 13% |

When asked how they found OpenDoors:

| Source | Students | % |
|---|---|---|
| Friend or family | 75 | 66% |
| Social media | 17 | 15% |
| Other | 16 | 14% |
| App store browsing | 4 | 4% |
| Advertisement | 2 | 2% |

The "Friend or family" answer is consistent with the 83% referral conversion — students who hear about it from a friend are also the ones most likely to actually play.

## A note on what we couldn't measure

The historical record of physical prize claims (when a student went to the restaurant and used their reward) was not preserved in the database we have access to. The post-redemption survey responses (would you return, did you buy something else, how much did you spend) are also not available. The numbers above reflect everything that happened *inside the app* — signups, games, wins, doors — which is the most complete record available.

## Recommendations

1. **Lean into referrals.** With an 83% activation rate, referrals are clearly the highest-quality growth channel. Make the referral entry on signup more prominent and reward both sides more visibly.
2. **Distributor doors need a nudge.** 23% of doors handed out by a distributor go unused. Consider sending a notification when a student has unspent distributed doors, especially as the door's 30-day expiration approaches.
3. **Most students want balanced prizes.** 68% prefer "something in the middle" — neither big-jackpot odds nor easy small wins. The default game odds should reflect that.
4. **Restore the post-redemption survey pipeline.** Going forward, persisting `user_rewards.claimed_at` and `redemption_surveys` rows would let future reports answer the most important business question: *of the prizes students won in the app, how many actually drove a restaurant visit and a purchase?*
