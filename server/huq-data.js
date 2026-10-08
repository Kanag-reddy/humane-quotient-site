/* Humane Quotient (HuQ) — CommonJS module for Express server */
const HUQ = {
  options: [
    { label: 'Almost Never', marks: 1 },
    { label: 'Rarely', marks: 2 },
    { label: 'Sometimes', marks: 3 },
    { label: 'Often', marks: 4 },
    { label: 'Almost Always', marks: 5 }
  ],
  levels: [
    { key: 'self', name: 'Self-Care', color: '#E0AC27', ink: '#470500', stage: 'Stream' },
    { key: 'socio', name: 'Socio-Care', color: '#A8450F', ink: '#FFFDE9', stage: 'River' },
    { key: 'universal', name: 'Universal Care', color: '#850500', ink: '#FFFDE9', stage: 'Ocean' }
  ],
  VALUE_MIN: 12,
  VALUE_MAX: 60,
  TOTAL_MIN: 96,
  TOTAL_MAX: 480,
  valueLevel: (s) => (s <= 28 ? 0 : s <= 44 ? 1 : 2),
  totalLevel: (t) => (t <= 228 ? 0 : t <= 356 ? 1 : 2),
  huqAssessment: [
    'Self-Care is the priority. You care mainly about the individual, with little regard for others.',
    'Socio-Care is the priority. You care for your family, friends and community with kindness and loyalty.',
    'Universal Care is the priority. You care for all people with compassion, kindness and empathy.'
  ],
  values: [
    {
      key: 'se', code: 'SeQ', name: 'Selflessness', quotient: 'Selflessness Quotient', facet: 'Service', group: 'Human Essence',
      definition: 'Selflessness is most plausibly thought of as putting others ahead of oneself.',
      facetText: 'Selflessness becomes visible through service — not only in physical acts of service but also through listening, advising, guiding, supporting and being available to others without a selfish motive.',
      leverage: "You often put others' needs before your own.",
      plan: {
        em: 'Spend more one-on-one time with others — not just helping, but actively listening to their emotions.',
        in: "Commit to being honest even when helping others; don't sacrifice truth for convenience.",
        ac: 'While helping, avoid judging whom you help. Consciously include those you find difficult to accept.',
        re: 'Channel your giving into sustained efforts; take ownership of outcomes, not just one-off acts.',
        eq: 'Ask yourself: "Am I helping everyone fairly?" Adjust support to those most in need, not just those close to you.',
        di: 'Volunteer with communities different from your own. Use your giving nature to break out of your cultural bubble.',
        ic: 'Invite people from marginalized groups into decisions or spaces you influence.'
      }
    },
    {
      key: 'em', code: 'EmQ', name: 'Empathy', quotient: 'Empathy Quotient', facet: 'Compassion', group: 'Human Essence',
      definition: 'Empathy is the ability to express concern.',
      facetText: "Empathy becomes visible through compassion. It is not limited to understanding another person's feelings but extends to responding with warmth, concern and supportive action.",
      leverage: "You feel others' emotions deeply.",
      plan: {
        se: 'Let your empathy move you to action — translate feeling into doing, even at your own inconvenience.',
        in: 'Stay true to your values, even when empathizing with people who challenge them.',
        ac: 'Use your emotional understanding to suspend judgment and see the deeper human story.',
        re: "Feel others' pain, then own your role in improving their situation, especially when it's uncomfortable.",
        eq: 'Tune into disparities — feel the weight of injustice, then advocate for fairness.',
        di: 'Seek emotional stories from different groups — read, listen, or engage. Let empathy drive curiosity.',
        ic: 'Use emotional intelligence to ensure everyone is heard and feels safe.'
      }
    },
    {
      key: 'in', code: 'InQ', name: 'Integrity', quotient: 'Integrity Quotient', facet: 'Ethics', group: 'Human Essence',
      definition: "Integrity is the state of being whole and faithful to one's moral principles.",
      facetText: "Integrity becomes visible through ethics. It is reflected when one's thoughts, words and actions remain aligned with truth, fairness and moral responsibility, even when there is no external supervision.",
      leverage: 'You act in alignment with your principles.',
      plan: {
        se: 'Ask: "Do my values include serving others, not just preserving my own virtue?" Act accordingly.',
        em: "Integrity without understanding can be cold. Practice stepping into others' shoes to guide fair decisions.",
        ac: 'Apply your fairness consistently — even to those whose views or lives differ from yours.',
        re: 'Hold yourself to your own standards consistently. Let your word and follow-through be your signature.',
        eq: "Align your values with systemic fairness. Don't just avoid wrongdoing — fight for what's right.",
        di: "Acknowledge your blind spots and seek perspectives you're missing.",
        ic: "Stand up for those excluded, even when it's inconvenient."
      }
    },
    {
      key: 'ac', code: 'AcQ', name: 'Acceptance', quotient: 'Acceptance Quotient', facet: 'Harmony', group: 'Human Essence',
      definition: 'Embracing thoughts, emotions and other internal experiences without judgment and without trying to change them.',
      facetText: 'Acceptance becomes visible through harmony. Differences in background, belief, ability, culture or opinion are not merely tolerated but peacefully accommodated with mutual respect.',
      leverage: 'You withhold judgement and make space for others.',
      plan: {
        se: 'Go from tolerating to serving — ask "How can I help those in need?"',
        em: 'Move beyond neutrality to emotional engagement. Be present with their emotions.',
        in: "Acceptance isn't passivity. Define your values and stay grounded as you welcome others.",
        re: "Don't just accept — act to support. Stand by people when things go wrong.",
        eq: 'Recognize which accepted differences involve real inequality, and speak up for balance.',
        di: 'Celebrate variety intentionally. Seek out, learn from, and elevate diverse voices.',
        ic: 'Make space in practice — invite input, adjust structures, and eliminate subtle barriers.'
      }
    },
    {
      key: 're', code: 'ReQ', name: 'Responsibility', quotient: 'Responsibility Quotient', facet: 'Stewardship', group: 'Human Essence',
      definition: 'Responsibility is an awareness of the obligation to contribute positively to society.',
      facetText: "Responsibility becomes visible through stewardship. It reflects the recognition that one's duties extend beyond personal benefit to the care of people, institutions, society, nature and future generations.",
      leverage: 'You take ownership seriously.',
      plan: {
        se: "Take responsibility for others' well-being too, not just duties or outcomes.",
        em: 'Use responsibility to pause and deeply understand how others feel before acting.',
        in: 'Ensure your sense of duty matches your values, not just external expectations.',
        ac: 'Own your biases. Then actively accept others as part of your duty to be just.',
        eq: 'Identify imbalances and feel responsible to address them.',
        di: "Learn and unlearn actively. If you're responsible for a group, make it diverse on purpose.",
        ic: 'Go beyond compliance. Make everyone feel like they belong.'
      }
    },
    {
      key: 'eq', code: 'EqQ', name: 'Equity', quotient: 'Equity Quotient', facet: 'Social Justice', group: 'EDI · Global Context',
      definition: 'Creating an environment where all those with diverse identities are welcomed and valued.',
      facetText: 'Equity becomes visible through social justice. Fairness is understood not as giving everyone the same treatment but as recognising different needs and removing barriers so that dignity and opportunity become accessible to all.',
      leverage: 'You care about fairness and justice.',
      plan: {
        se: 'Share your privileges and give others a lift, even when it costs you.',
        em: 'Ground your fairness in real emotion. Listen to how injustice feels to others.',
        in: 'Walk the talk. Align your actions consistently with your commitment to fairness.',
        ac: "Equity begins by seeing each person's value and worth without judgment.",
        re: "Don't just call out injustice — own your role in fixing it.",
        di: 'Actively bring underrepresented voices into the conversation.',
        ic: "Ensure policies aren't just fair but also welcoming and empowering."
      }
    },
    {
      key: 'di', code: 'DiQ', name: 'Diversity', quotient: 'Diversity Quotient', facet: 'Interconnectedness', group: 'EDI · Global Context',
      definition: "Diversity is recognising, respecting and celebrating each other's differences.",
      facetText: 'Diversity becomes visible through interconnectedness. The variety of human identities, cultures, perspectives and experiences is understood as part of a larger shared human existence.',
      leverage: 'You value difference and broad perspectives.',
      plan: {
        se: 'Go beyond appreciating differences — sacrifice to support diverse communities.',
        em: 'Seek deeper understanding, not just exposure. Let curiosity turn into compassion.',
        in: 'Anchor your celebration of difference in consistent, honest respect.',
        ac: 'Diversity without judgment is real inclusion — watch for subtle biases.',
        re: "Don't just appreciate variety — steward it.",
        eq: 'Identify where diversity lacks equity. Push for both representation and fairness.',
        ic: "Create environments where every kind of person thrives, not just appears."
      }
    },
    {
      key: 'ic', code: 'IcQ', name: 'Inclusivity', quotient: 'Inclusivity Quotient', facet: 'Wholeness', group: 'EDI · Global Context',
      definition: 'Inclusion means creating an environment where everyone feels welcome and valued.',
      facetText: 'Inclusivity becomes visible through wholeness. Every individual is welcomed, valued and allowed to participate meaningfully, so that no one is excluded from the collective sense of belonging.',
      leverage: 'You create space where others feel they belong.',
      plan: {
        se: 'Sacrifice your comfort to include others fully. True inclusion takes effort.',
        em: "Inclusion is deeper when it's emotional. Listen for the silent voices.",
        in: 'Inclusion must be principled, not performative.',
        ac: 'Practice radical hospitality — open space in your heart as well as your table.',
        re: 'Be the keeper of the culture. Maintain inclusive norms even when others drop them.',
        eq: "Balance inclusion with fairness. Don't just invite — support equitably.",
        di: 'Inclusion thrives on variety. Invite all voices, especially those unlike your own.'
      }
    }
  ],
  totalQuestions: 96,
  score: function (answers) {
    const scored = HUQ.values.map((v, vi) => {
      let s = 0;
      for (let q = 0; q < 12; q++) s += answers[vi * 12 + q];
      return {
        key: v.key,
        code: v.code,
        name: v.name,
        score: s,
        quotient: s / 6,
        level: HUQ.valueLevel(s)
      };
    });
    const total = scored.reduce((x, v) => x + v.score, 0);
    const max = Math.max(...scored.map((v) => v.score));
    const strongest = scored.filter((v) => v.score === max).map((v) => v.key);
    return {
      values: scored,
      total,
      huq: total / 48,
      level: HUQ.totalLevel(total),
      strongest,
      max
    };
  }
};

module.exports = HUQ;
