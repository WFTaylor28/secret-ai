import React from "react";

const policySections = [
  {
    title: "1. Strictly Prohibited Content",
    items: [
      {
        label: "Child Exploitation",
        desc: "Do not create or depict characters who are minors or whose age is not clearly defined as over 18. This includes 'aged-up' characters, originally depicted as minors in source material. Realistic or human-like depictions of underage characters, even if fictional, are strictly prohibited. We explicitly prohibit the posting of any content that sexually exploits minors or endangers their safety, including but not limited to child pornography, sexual exploitation, or any form of harm or harassment towards minors."
      },
      {
        label: "Illegal Content",
        desc: "Any content that violates local, national, or international laws and regulations is not allowed. This encompasses, but is not limited to, material related to illegal drugs, violence, or any activities that promote or support unlawful behavior."
      },
      {
        label: "Hate Speech and Discrimination",
        desc: "We reject any content that incites hate, discrimination, or harassment against individuals based on factors such as race, ethnicity, nationality, religion, gender, sexual orientation, disability, or any other protected attribute. This includes content related to or depicting historical atrocities or idolization of hate figures."
      },
      {
        label: "Violence and Harm",
        desc: "Content that incites, glorifies, or promotes violence, self-harm, or harm to others is strictly prohibited. This includes content that encourages suicide, terrorism, or any form of harm, as well as realistic depictions of gore, including but not limited to acts causing death to animals, murder, cannibalism, etc."
      },
      {
        label: "Bestiality",
        desc: "Any content related to bestiality is not allowed. However, role-playing with anthropomorphized fictional characters to enhance a story's narrative is acceptable, provided it does not involve sexual acts. This will be assessed based on context and character traits."
      },
      {
        label: "Misinformation",
        desc: "Do not post misinformation that is likely to contribute to the risk of imminent violence or physical harm or interfere with the functioning of political processes."
      },
      {
        label: "Glorifying Sexual Violence",
        desc: "Content that includes non-consensual, rape, sexual abuse, etc., is prohibited. However, within the context of romantic and ambiguous relationships, behavior and language that are controlling, proactive, dominant, and rude may be acceptable. This will be assessed based on specific circumstances."
      },
      {
        label: "Incest",
        desc: "Any relationships between the user and the bot—or multiple characters in a bot—suggesting family connections, including non-blood-related scenarios such as step-parents, are strictly prohibited from engaging in sexual or romantic activities."
      },
      {
        label: "Celebrity and Real Person",
        desc: "Do not post real images or realistic AI-generated images of any individuals. This prohibition includes images that might be indistinguishable from real photos, to protect individual privacy and prevent the misuse of someone's likeness without consent. Permitted content may include parody, but users must respect these boundaries to ensure a respectful and safe environment. We prohibit the creation of bots that are modeled after celebrities or real individuals, including but not limited to text and images."
      },
      {
        label: "Explicit Imagery",
        desc: "Explicit images and avatars are not permitted, including but not limited to overly revealing clothing, exposure of genitalia, and any other forms of explicit content."
      },
      {
        label: "Infringement on Privacy and Copyright",
        desc: "Any content that infringes on privacy, copyrights, trademarks, or intellectual property rights of individuals or organizations is prohibited. This includes sharing personal information without consent, using pirated materials, and any unauthorized use of copyrighted content."
      },
      {
        label: "Restricted Goods",
        desc: "Content involving the sale, trade, or promotion of illegal or regulated goods and services is strictly prohibited to ensure compliance with laws and platform safety."
      },
      {
        label: "Meaningless Content",
        desc: "Spam, nonsensical, or low-quality content is not allowed to maintain a positive and valuable user experience."
      },
      {
        label: "Self-Harm",
        desc: "Content that promotes, glorifies, or encourages self-harm or suicide is banned to protect user well-being and mental health."
      }
    ]
  }
];


const TermsPage = () => (
  <div style={{ background: '#18122B', minHeight: '100vh', color: '#fff', fontFamily: 'Inter, Arial, sans-serif' }}>
    <div style={{ maxWidth: 980, margin: '0 auto', padding: '56px 24px 72px 24px' }}>
      <h1 style={{ fontSize: 40, fontWeight: 900, marginBottom: 24, color: '#fff', letterSpacing: '-1px' }}>Blocked Content Policy & Terms of Service</h1>
      <div style={{ borderBottom: '1.5px solid #2d1e4f', marginBottom: 32 }} />
      <section style={{ marginBottom: 40 }}>
        <h2 style={{ fontSize: 22, fontWeight: 700, color: '#b8b8ff', marginBottom: 10 }}>Introduction</h2>
        <p style={{ fontSize: 18, color: '#e0e0e0', marginBottom: 0 }}>
          SecretAI is dedicated to providing a safe, creative, and respectful environment for all users. This Blocked Content Policy and Terms of Service outlines the types of content and conduct that are strictly prohibited on our platform. By using SecretAI, you agree to comply with these rules to help us maintain a positive and lawful community.
        </p>
      </section>
      {policySections.map((section, idx) => (
        <section key={idx} style={{ marginBottom: 44 }}>
          <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 16, color: '#b8b8ff', letterSpacing: '-0.5px' }}>{section.title}</h2>
          <ol style={{ paddingLeft: 28, listStyleType: 'lower-alpha' }}>
            {section.items.map((item, i) => (
              <li key={i} style={{ marginBottom: 18, fontSize: 17, lineHeight: 1.7 }}>
                <span style={{ fontWeight: 700, color: '#ffd700' }}>{item.label}:</span> <span style={{ color: '#e0e0e0' }}>{item.desc}</span>
              </li>
            ))}
          </ol>
        </section>
      ))}
      <section style={{ marginBottom: 40 }}>
        <h2 style={{ fontSize: 22, fontWeight: 700, color: '#b8b8ff', marginBottom: 10 }}>Scope</h2>
        <p style={{ color: '#e0e0e0', fontSize: 17 }}>
          This policy applies to all content, characters, images, and interactions on SecretAI, including public and private chats, character creation, and any user-generated material.
        </p>
      </section>
      <section style={{ marginBottom: 40 }}>
        <h2 style={{ fontSize: 22, fontWeight: 700, color: '#b8b8ff', marginBottom: 10 }}>Enforcement</h2>
        <p style={{ color: '#e0e0e0', fontSize: 17 }}>
          Violations of this policy may result in content removal, account suspension, or permanent bans. SecretAI reserves the right to review, moderate, and remove any content or accounts that breach these terms at our sole discretion.
        </p>
      </section>
      <section style={{ marginBottom: 40 }}>
        <h2 style={{ fontSize: 22, fontWeight: 700, color: '#b8b8ff', marginBottom: 10 }}>Contact</h2>
        <p style={{ color: '#e0e0e0', fontSize: 17 }}>
          If you have questions or need to report a violation, please contact us at <a href="mailto:support@secretai.app" style={{ color: '#ffd700', textDecoration: 'underline' }}>support@secretai.app</a>.
        </p>
      </section>
      <div style={{ marginTop: 40, color: '#b8b8ff', fontSize: 16 }}>
        <strong>Why these rules?</strong>
        <p style={{ color: '#e0e0e0', marginTop: 8 }}>
          These rules exist to protect users, uphold legal and ethical standards, and ensure SecretAI remains a safe, respectful, and creative space for everyone.
        </p>
      </div>
    </div>
  </div>
);

export default TermsPage;
