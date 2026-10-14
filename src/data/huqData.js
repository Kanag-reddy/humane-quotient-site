/* Humane Quotient (HuQ) — shared content + scoring.
   Source: "Test Your Humane Quotient" (First Edition, Revised), Dr Rachiraju Sai Krishna & Prof Dr Thothathri Venugopal. */

export const options = [
  { label: 'Almost Never', marks: 1 },
  { label: 'Rarely', marks: 2 },
  { label: 'Sometimes', marks: 3 },
  { label: 'Often', marks: 4 },
  { label: 'Almost Always', marks: 5 }
];

export const levels = [
  { key: 'self', name: 'Self-Care', color: '#E0AC27', ink: '#470500', stage: 'Stream' },
  { key: 'socio', name: 'Socio-Care', color: '#A8450F', ink: '#FFFDE9', stage: 'River' },
  { key: 'universal', name: 'Universal Care', color: '#850500', ink: '#FFFDE9', stage: 'Ocean' }
];

export const VALUE_MIN = 12;
export const VALUE_MAX = 60;
export const TOTAL_MIN = 96;
export const TOTAL_MAX = 480;

export function valueLevel(s) {
  return s <= 28 ? 0 : s <= 44 ? 1 : 2;
}

export function totalLevel(t) {
  return t <= 228 ? 0 : t <= 356 ? 1 : 2;
}

export const huqAssessment = [
  'Your responses place Self-Care as the current priority: care is more centered on your own needs in this snapshot. Consider this a starting point, not a judgment; growth can include widening your circle of care.',
  'Your responses place Socio-Care as the current priority: care extends strongly to people in your family, friendships, and community. A next area to explore is how those habits can reach beyond familiar circles.',
  'Your responses place Universal Care as the current priority: your answers reflect a broad circle of concern across people and contexts. Continue translating that intention into consistent everyday action.'
];

export const values = [
  {
    key: 'se', code: 'SeQ', name: 'Selflessness', quotient: 'Selflessness Quotient', facet: 'Service', group: 'Human Essence',
    definition: 'Selflessness is most plausibly thought of as putting others ahead of oneself.',
    facetText: 'Selflessness becomes visible through service — not only in physical acts of service but also through listening, advising, guiding, supporting and being available to others without a selfish motive.',
    assess: [
      'You recognize that others have needs and begin to act beyond self-interest occasionally.',
      'You regularly consider others in decision-making, even when inconvenient.',
      'You put collective well-being first as a natural instinct, without expectation of return.'
    ],
    traits: ["Puts others' needs before personal gain", 'Offers time, skills and presence without expecting return', 'Demonstrates humility and generosity in action', 'Views service as a natural extension of love and belonging'],
    aspects: [
      { name: 'Self-sacrificing love', qs: [
        'In a typical week, how often do you look for ways to support others?',
        'In a typical week, how often do you offer help to others without expecting anything in return?',
        'In a typical week, how often do you show respect and kindness to people from all walks of life?'
      ]},
      { name: 'Low self-centeredness', qs: [
        'In a typical week, how often do you extend help to someone even if it takes your time?',
        'In a typical week, how often do you forgive someone even if they hurt you?',
        'In a typical week, how often do you act with concern for others?'
      ]},
      { name: 'Helping others', qs: [
        'In a typical week, how often do you contribute to the well-being of everyone?',
        'In a typical week, how often do you remain kind and helpful when someone is rude to you?',
        'In a typical week, how often do you think about others before thinking about your own comfort?'
      ]},
      { name: 'Sense of connectedness', qs: [
        'In a typical week, how often do you speak or act with kindness and care toward people regardless of their background, status or opinions?',
        'In a typical week, how often do you feel happy when others are happy?',
        'In a typical week, how often do you treat strangers with the same care and concern as you do with friends or family?'
      ]}
    ],
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
    assess: [
      "You can identify and acknowledge others' emotions.",
      "You actively try to understand others' experiences and viewpoints.",
      'You use emotional insight to guide meaningful, supportive behavior.'
    ],
    traits: ["Feels and understands others' emotions and suffering", 'Responds with warmth, support and non-judgmental care', 'Practices emotional presence, especially in adversity', 'Bridges differences with kindness and shared humanity'],
    aspects: [
      { name: 'Experiencing feelings', qs: [
        "In a typical week, how often do you try to put yourself in someone else's shoes before reacting?",
        "In a typical week, how often do you sense others' problems in situations?",
        "In a typical week, how often do you go the extra mile to help understand others' problems?"
      ]},
      { name: 'Perspective taking', qs: [
        'In a typical week, how often do you gauge the emotional state of a person by just looking at him/her?',
        'In a typical week, how often do you feel concerned when others struggle to reach their goals?',
        'In a typical week, how often do you weigh the pros and cons before making a decision?'
      ]},
      { name: 'Understanding emotions', qs: [
        'In a typical week, how often do you feel sad when someone else is feeling sad?',
        'In a typical week, how often do you feel upset when you see an animal in pain?',
        "In a typical week, how often do you put yourself in someone else's shoes to understand how they feel?"
      ]},
      { name: 'Express emotion', qs: [
        'In a typical week, how often do you listen when someone wants to talk about their problems?',
        "In a typical week, how often do you consider how a situation looks from the other person's side before reacting?",
        'In a typical week, how often do you ask yourself, "What would I feel if I were in their place?"'
      ]}
    ],
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
    assess: [
      'You act honestly when rules or oversight are present.',
      'You maintain truth and principles even when no one is watching.',
      'You inspire others through unwavering ethical behavior.'
    ],
    traits: ['Upholds moral principles even when inconvenient', 'Aligns words and actions with core values', 'Makes just decisions based on truth, not personal interest', 'Gains trust by being consistent and transparent'],
    aspects: [
      { name: 'Ethical commitment', qs: [
        'In a typical week, how well do you admit your mistakes instead of hiding them?',
        'In a typical week, how often do you admit when you are wrong, even without being told?',
        'In a typical week, how well do you speak up when you know something is unfair?'
      ]},
      { name: 'Ethical autonomy', qs: [
        'In a typical week, how often do you listen to advice but still decide based on what feels ethically right to you?',
        'In a typical week, how often do you keep doing what is right even when you are the only one doing it?',
        'In a typical week, how often do you follow what you believe is right even when others disagree?'
      ]},
      { name: 'Behavioural consistency', qs: [
        'In a typical week, how often do you behave the same way whether or not someone is watching?',
        'In a typical week, how often do you keep your commitments even in small things?',
        'In a typical week, how often are you honest in your words even when no one is checking?'
      ]},
      { name: 'Moral uprightness', qs: [
        'In a typical week, how often do you tell the truth even if it might get you in trouble?',
        'In a typical week, how often do you stick to your principles even when the situation changes?',
        'In a typical week, how often do you act honestly even if it may lead to trouble or loss?'
      ]}
    ],
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
    assess: [
      'You allow differences without hostility.',
      'You seek to understand and learn from differences.',
      'You fully value and integrate diversity of people, ideas and experiences.'
    ],
    traits: ['Respects diversity of thought, identity and culture', 'Cultivates peace in relationships and groups', 'Resolves conflicts through understanding and mutual respect', 'Seeks inner balance as a foundation for outer harmony'],
    aspects: [
      { name: 'Respecting differences', qs: [
        'In a typical week, how often do you treat everyone equally irrespective of their background or opinion?',
        'In a typical week, how often do you focus on what can be done, instead of complaining?',
        'In a typical week, how often do you offer help to someone who is going through a tough time?'
      ]},
      { name: 'Perceived acceptance', qs: [
        "In a typical week, how often do you listen to others' opinions without interrupting or dismissing them?",
        'In a typical week, how often do you treat others with kindness?',
        "In a typical week, how often do you encourage others' personal growth and well-being?"
      ]},
      { name: 'Emotional support', qs: [
        'In a typical week, how often do you accept feedback from others?',
        'In a typical week, how often do you show love and care for others through your actions?',
        'In a typical week, how often do you care about the well-being of others?'
      ]},
      { name: 'Self-acceptance', qs: [
        'In a typical week, how often do you let yourself feel without judging your feelings or emotions?',
        'In a typical week, how often do you pause and choose a response that matches your values?',
        'In a typical week, how often do you notice your emotions as soon as they arise?'
      ]}
    ],
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
    assess: [
      'You take responsibility when required or prompted.',
      'You accept personal and shared accountability proactively.',
      'You feel responsible for the greater good, acting with foresight and care.'
    ],
    traits: ['Takes ownership of actions and their impact on others and the Earth', 'Cares for shared resources as a custodian, not a consumer', 'Acts with foresight, preserving well-being for future generations', 'Embraces duties beyond the self, including community and planet'],
    aspects: [
      { name: 'Meeting needs', qs: [
        'In a typical week, how often do you make decisions that benefit others, not just yourself?',
        'In a typical week, how well do you notice when someone is feeling low?',
        'In a typical week, how well do you find simple ways to help someone in difficulty?'
      ]},
      { name: 'Personal accountability', qs: [
        'In a typical week, how well do you think before you act?',
        'In a typical week, how well do you avoid blaming others when something goes wrong?',
        'In a typical week, how well do you accept both good and bad results of your decisions?'
      ]},
      { name: 'Self-discipline', qs: [
        'In a typical week, how often do you keep trying even when things are hard or you feel like giving up?',
        'In a typical week, how often do you pause and think before reacting in tough situations?',
        'In a typical week, how well do you manage your emotions and stay calm under pressure?'
      ]},
      { name: 'Courageous action', qs: [
        'In a typical week, how often do you act when something needs to be done, even without being asked?',
        "In a typical week, how well do you take the right action even when there's risk?",
        'In a typical week, how well do you make decisions based on your intuition?'
      ]}
    ],
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
    assess: [
      'You believe everyone should be treated the same.',
      'You understand that different needs require different supports.',
      'You work to dismantle systemic barriers and ensure just outcomes for all.'
    ],
    traits: ['Recognizes and addresses systemic inequalities', 'Advocates for fair access to opportunity, safety and dignity', 'Aims to empower the marginalized and redistribute privilege', 'Moves from charity to structural change'],
    aspects: [
      { name: 'Barrier removal', qs: [
        'In a typical week, how often do you try to include people who are usually left out?',
        'In a typical week, how often do you make sure everyone, including quieter members, gets a chance to speak in group work?',
        "In a typical week, how well do you volunteer to help people even if you don't know them personally?"
      ]},
      { name: 'Resource allocation', qs: [
        "In a typical week, how often are you open to others' views and experiences even if they're different from yours?",
        "In a typical week, how often do you understand each person's needs before offering help or support?",
        'In a typical week, how often do you try to understand what kind of support each person needs?'
      ]},
      { name: 'Fair access', qs: [
        "In a typical week, how often do you keep standing up for fairness even when it's hard?",
        "In a typical week, how often do you ask people who feel left out about what's holding them back?",
        'In a typical week, how often do you ask others for feedback on how to make things fair for everyone?'
      ]},
      { name: 'Personalized inclusion', qs: [
        "In a typical week, how often do you adjust your words to match each person's interests?",
        'In a typical week, how often do you check in with individuals to make sure they feel included and understood?',
        'In a typical week, how often do you extend kindness and warmth to those around you?'
      ]}
    ],
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
    assess: [
      'You recognize the presence or lack of diverse people.',
      'You understand that diversity enriches thought and outcomes.',
      'You actively foster environments that thrive on and grow from diversity.'
    ],
    traits: ['Celebrates uniqueness while honoring common humanity', 'Understands all beings, systems and life forms are interdependent', 'Learns from different perspectives and cultural narratives', 'Fosters collaboration across identities and boundaries'],
    aspects: [
      { name: 'Social inclusion', qs: [
        'In a typical week, how often do you include people from different cultures in a group activity?',
        'In a typical week, how often do you celebrate different festivals or traditions with others?',
        'In a typical week, how often do you understand that other cultures need support and connection too?'
      ]},
      { name: 'Varied perspectives', qs: [
        "In a typical week, how often do you notice the ways people's backgrounds shape their perspectives?",
        'In a typical week, how often do you ask people in the community what kind of help they need?',
        'In a typical week, how often do you make different people feel accepted and supported?'
      ]},
      { name: 'Embracing differences', qs: [
        "In a typical week, how often do you adjust group activities to make use of everyone's unique skills?",
        'In a typical week, how aware are you of your own biases and how they affect your thinking?',
        'In a typical week, how often do you avoid judging a whole group based on one person?'
      ]},
      { name: 'Individual uniqueness', qs: [
        "In a typical week, how often do you ask about people's individual needs and try to meet them?",
        'In a typical week, how often do you avoid saying things that are unfair or hurtful to others?',
        'In a typical week, how often can you see your own strengths and weaknesses in accepting differences and try to improve?'
      ]}
    ],
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
    assess: [
      'You allow others to participate.',
      'You ensure everyone feels welcome and safe to contribute.',
      'You share power and influence to shape the space collectively.'
    ],
    traits: ['Creates environments where every voice matters', 'Integrates all parts of the human experience — mind, body, heart and spirit', 'Sees unity in multiplicity; no one is left out or left behind', 'Moves toward healing and collective completeness'],
    aspects: [
      { name: 'Welcoming environment', qs: [
        'In a typical week, how often do you try to learn something personal, like a name or background, about each person?',
        'In a typical week, how often do you treat everyone with respect, no matter their role or status?',
        "In a typical week, how often do you appreciate and acknowledge everyone's contributions, big or small?"
      ]},
      { name: 'Respectful belonging', qs: [
        'In a typical week, how often do you greet others in a way that makes them feel truly welcome?',
        'In a typical week, how often do you proactively reach out to underrepresented groups through your service?',
        'In a typical week, how often do you stay committed to a cause even when you face challenges?'
      ]},
      { name: 'Continuous learning', qs: [
        'In a typical week, how often do you build genuine relationships with those who have different backgrounds?',
        'In a typical week, how often do you handle misunderstandings or conflicts that arise from differences?',
        "In a typical week, how often do you pause to reflect on what others' perspectives teach you?"
      ]},
      { name: 'Equitable access', qs: [
        'In a typical week, how often do you think about your own assumptions before judging others?',
        'In a typical week, how often do you mentor or sponsor people who might otherwise be overlooked?',
        'In a typical week, how often do you speak up for resources or support for underserved groups?'
      ]}
    ],
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
];

export const questionsPerValue = 12;
export const totalQuestions = 96;

export const questions = [];
values.forEach((v, vi) => v.aspects.forEach((a, ai) => a.qs.forEach((text, qi) => {
  questions.push({
    index: questions.length,
    value: v.key,
    valueIndex: vi,
    aspectIndex: ai,
    aspect: a.name,
    text,
    id: v.code.replace('Q', '') + '-A' + (ai + 1) + '-Q' + (qi + 1)
  });
})));

export function score(answers) {
  const scoredValues = values.map((v, vi) => {
    const aspects = v.aspects.map((a, ai) => {
      let s = 0;
      for (let q = 0; q < 3; q++) s += answers[vi * 12 + ai * 3 + q];
      return s;
    });
    const totalScore = aspects.reduce((x, y) => x + y, 0);
    return {
      key: v.key,
      code: v.code,
      name: v.name,
      score: totalScore,
      quotient: totalScore / 6,
      level: valueLevel(totalScore),
      aspects
    };
  });
  const total = scoredValues.reduce((x, v) => x + v.score, 0);
  const max = Math.max(...scoredValues.map((v) => v.score));
  const strongest = scoredValues.filter((v) => v.score === max).map((v) => v.key);
  return {
    values: scoredValues,
    total,
    huq: total / 48,
    level: totalLevel(total),
    strongest,
    max
  };
}

export const profileOptions = {
  roles: [
    'Student', 'Teacher / Faculty', 'Researcher / Research scholar',
    'Academic administrator', 'Software / IT professional', 'Engineer',
    'Healthcare professional', 'Business / Entrepreneur', 'Self-employed',
    'Government / Public service', 'Social / Non-profit worker', 'Homemaker',
    'Retired', 'Other'
  ],
  other: 'Other',
  qualifications: [
    'Below Class 10', 'Class 10 (SSLC / Secondary)', 'Class 12 (PUC / Higher Secondary)',
    'Diploma / ITI', 'Bachelor’s degree', 'Master’s degree', 'M.Phil',
    'PhD / Doctorate', 'Post-doctoral', 'Professional qualification (CA / CS / MBBS / LLB etc.)',
    'Other'
  ],
  academic: {
    'Student': {
      course: 'Course / Programme',
      stageLabel: 'Year of study',
      stages: ['1st year', '2nd year', '3rd year', '4th year', '5th year or above', 'Completed']
    },
    'Teacher / Faculty': {
      course: 'Department / Subject',
      stageLabel: 'Teaching experience',
      stages: ['Below 5 years', '5–10 years', '10–20 years', 'Above 20 years']
    },
    'Researcher / Research scholar': {
      course: 'Field of research',
      stageLabel: 'Research stage',
      stages: ['Master’s (research)', 'Pursuing PhD', 'Post-doctoral', 'Independent researcher']
    }
  }
};
