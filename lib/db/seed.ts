import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import { config } from "dotenv";
import bcrypt from "bcryptjs";
import { randomBytes } from "crypto";
import * as schema from "./schema";

config({ path: ".env.local" });

async function main() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not set. Add it to .env.local.");
  }

  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const db = drizzle(pool, { schema });

  console.log("Seeding Leo Tech Solution database...\n");

  // ---------- Site settings ----------
  await db
    .insert(schema.siteSettings)
    .values({
      id: 1,
      companyName: "Leo Tech Solution",
      tagline: "Engineering software, systems, and skills for what's next.",
      footerDescription:
        "Leo Tech Solution designs and builds custom software, AI/ML, IoT, and cloud systems — and runs a hands-on technology training academy for the engineers who will run them.",
      email: "hello@leotechsolution.com",
      phone: "+1 (415) 555-0148",
      address: "148 Harbor Point Drive, Suite 400, San Francisco, CA 94105",
      businessHours: "Mon – Fri, 9:00 AM – 6:00 PM (PST)",
      schedulingUrl: null,
      socialLinks: [
        { label: "LinkedIn", url: "https://linkedin.com/company/leotechsolution" },
        { label: "Twitter", url: "https://twitter.com/leotechsolution" },
        { label: "GitHub", url: "https://github.com/leotechsolution" },
        { label: "Instagram", url: "https://instagram.com/leotechsolution" },
      ],
      defaultSeoTitle: "Leo Tech Solution — Software, AI/ML, IoT & Technology Training",
      defaultSeoDescription:
        "Leo Tech Solution designs and builds custom software, AI/ML, IoT, cloud, and cybersecurity solutions, and runs a hands-on technology training academy.",
      defaultOgImage: "/brand/leotech-logo.svg",
    })
    .onConflictDoNothing();
  console.log("✓ Site settings");

  // ---------- Homepage sections ----------
  const sectionDefs: { key: string; label: string; order: number }[] = [
    { key: "hero", label: "Hero", order: 0 },
    { key: "about", label: "About", order: 1 },
    { key: "services", label: "Services", order: 2 },
    { key: "technologies", label: "Technology Stack", order: 3 },
    { key: "projects", label: "Projects", order: 4 },
    { key: "training", label: "Training", order: 5 },
    { key: "why_leotech", label: "Why LeoTech", order: 6 },
    { key: "process", label: "Process", order: 7 },
    { key: "testimonials", label: "Testimonials", order: 8 },
    { key: "team", label: "Team", order: 9 },
    { key: "blog", label: "Blog", order: 10 },
    { key: "cta", label: "Call To Action", order: 11 },
  ];
  await db
    .insert(schema.homepageSections)
    .values(sectionDefs.map((s) => ({ sectionKey: s.key, label: s.label, order: s.order, enabled: true })))
    .onConflictDoNothing();
  console.log("✓ Homepage sections");

  // ---------- Hero slides ----------
  await db.insert(schema.heroSlides).values([
    {
      title: "Engineering Software,\nSystems & Skills for What's Next",
      subtitle: "TECHNOLOGY • INNOVATION • TRAINING",
      description:
        "Leo Tech Solution designs and builds custom software, AI/ML, IoT, and cloud systems — and trains the engineers who run them.",
      cta1Label: "Start a Project",
      cta1Href: "/contact",
      cta2Label: "Explore Services",
      cta2Href: "/services",
      order: 0,
      active: true,
    },
    {
      title: "From Architecture\nto Production, Owned End-to-End",
      subtitle: "CUSTOM SOFTWARE • CLOUD • AI/ML",
      description:
        "We design systems that are maintainable, secure, and built to scale — backed by a team that stays through deployment and beyond.",
      cta1Label: "See Our Work",
      cta1Href: "/projects",
      cta2Label: "Meet the Team",
      cta2Href: "/about",
      order: 1,
      active: true,
    },
    {
      title: "A Training Academy\nBuilt Around Real Projects",
      subtitle: "COURSES • INTERNSHIPS • CERTIFICATION",
      description:
        "Hands-on programs in web development, AI/ML, cloud, and cybersecurity — taught by engineers who build production systems.",
      cta1Label: "Browse Courses",
      cta1Href: "/training",
      cta2Label: "View Internships",
      cta2Href: "/internships",
      order: 2,
      active: true,
    },
  ]);
  console.log("✓ Hero slides");

  // ---------- Statistics ----------
  await db.insert(schema.statistics).values([
    { label: "Projects Delivered", value: 120, suffix: "+", order: 0 },
    { label: "Clients Served", value: 65, suffix: "+", order: 1 },
    { label: "Technologies Used", value: 40, suffix: "+", order: 2 },
    { label: "Students Trained", value: 800, suffix: "+", order: 3 },
  ]);
  console.log("✓ Statistics");

  // ---------- Why LeoTech ----------
  await db.insert(schema.whyLeotechItems).values([
    {
      title: "Modern Technology",
      description: "We build on current, well-supported frameworks and infrastructure — not legacy patterns dressed up as modern ones.",
      icon: "cpu",
      order: 0,
    },
    {
      title: "Experienced Engineers",
      description: "Every project is staffed by engineers who have shipped production systems, not just prototypes.",
      icon: "team",
      order: 1,
    },
    {
      title: "Practical Training",
      description: "Our courses are built around the same tools and workflows we use on client projects, not generic curricula.",
      icon: "education",
      order: 2,
    },
    {
      title: "Real Projects",
      description: "Students and interns work on functioning systems with real constraints, not disposable class exercises.",
      icon: "code",
      order: 3,
    },
    {
      title: "Custom Solutions",
      description: "We design around your actual constraints and goals instead of forcing a templated product onto your business.",
      icon: "tools",
      order: 4,
    },
    {
      title: "Long-Term Support",
      description: "We stay engaged after launch — monitoring, maintaining, and evolving systems as requirements change.",
      icon: "server",
      order: 5,
    },
  ]);
  console.log("✓ Why LeoTech items");

  // ---------- Process steps ----------
  await db.insert(schema.processSteps).values([
    { title: "Discover", description: "We study your goals, constraints, and existing systems before proposing any solution.", icon: "lightbulb", order: 0 },
    { title: "Plan", description: "We scope the work into a clear roadmap with milestones, architecture, and success criteria.", icon: "layers", order: 1 },
    { title: "Design", description: "We design the system architecture and interface before writing production code.", icon: "design", order: 2 },
    { title: "Develop", description: "We build in iterative, reviewable increments so progress stays visible throughout.", icon: "code", order: 3 },
    { title: "Test", description: "We test functionality, performance, and security before anything reaches production.", icon: "shieldcheck", order: 4 },
    { title: "Deploy", description: "We ship with proper CI/CD, monitoring, and rollback plans in place from day one.", icon: "rocket", order: 5 },
    { title: "Support", description: "We stay engaged post-launch to monitor, maintain, and evolve the system as needs change.", icon: "server", order: 6 },
  ]);
  console.log("✓ Process steps");

  // ---------- FAQs ----------
  await db.insert(schema.faqs).values([
    { question: "What industries does Leo Tech Solution work with?", answer: "We work primarily with technology, healthcare, logistics, and education companies, though our engineering process applies to most software-driven businesses.", category: "General", order: 0 },
    { question: "How long does a typical software project take?", answer: "Most custom software engagements run 8–20 weeks depending on scope. We provide a detailed timeline after the discovery phase.", category: "General", order: 1 },
    { question: "Do you offer ongoing maintenance after launch?", answer: "Yes. Every project includes an optional support plan covering monitoring, bug fixes, and incremental improvements.", category: "General", order: 2 },
    { question: "Are your training courses available online?", answer: "Yes, courses run both online and in a hybrid format, with live instruction and recorded sessions for review.", category: "Training", order: 3 },
    { question: "Do I need prior experience to join an internship?", answer: "Most internships require completion of a related foundational course or equivalent self-taught experience, verified during the application review.", category: "Training", order: 4 },
    { question: "Do students receive a certificate?", answer: "Yes, students who complete a course's curriculum and final project receive a Leo Tech Solution certificate of completion.", category: "Training", order: 5 },
    { question: "What is your pricing model for client projects?", answer: "We scope most projects as fixed-price milestones after discovery. Ongoing support is billed monthly or hourly depending on the engagement.", category: "Pricing", order: 6 },
    { question: "Can you work with our existing engineering team?", answer: "Yes — we regularly integrate with in-house teams, either augmenting capacity or owning a specific subsystem end-to-end.", category: "Pricing", order: 7 },
  ]);
  console.log("✓ FAQs");

  // ---------- Services ----------
  const services = [
    {
      slug: "custom-software-development",
      title: "Custom Software Development",
      shortDescription: "Bespoke applications designed around your actual workflows, not a generic template.",
      description:
        "We design and build custom software from the ground up — internal tools, customer-facing platforms, and everything between. Every engagement starts with understanding how your business actually operates, then architecting a system that fits it.",
      icon: "code",
      features: ["Requirements & architecture workshops", "Iterative, milestone-based delivery", "Full source code ownership", "Post-launch support plans"],
      technologies: ["TypeScript", "Node.js", "PostgreSQL", "React"],
      order: 0,
      featured: true,
    },
    {
      slug: "web-development",
      title: "Web Development",
      shortDescription: "Fast, accessible, SEO-ready web applications built on modern frameworks.",
      description:
        "From marketing sites to complex web applications, we build on modern, well-supported frameworks with performance and accessibility as first-class requirements — not afterthoughts.",
      icon: "globe",
      features: ["Server-rendered & static architectures", "Core Web Vitals optimization", "CMS-driven content", "Cross-browser & responsive testing"],
      technologies: ["Next.js", "React", "Tailwind CSS", "PostgreSQL"],
      order: 1,
      featured: true,
    },
    {
      slug: "mobile-app-development",
      title: "Mobile App Development",
      shortDescription: "Native-quality iOS and Android apps from a single cross-platform codebase.",
      description:
        "We build mobile applications that feel native on both iOS and Android, sharing a single codebase to keep development efficient without sacrificing platform-specific polish.",
      icon: "smartphone",
      features: ["Cross-platform architecture", "Offline-first data sync", "App Store & Play Store release management", "Push notifications & deep linking"],
      technologies: ["React Native", "TypeScript", "GraphQL"],
      order: 2,
      featured: false,
    },
    {
      slug: "ai-machine-learning",
      title: "AI & Machine Learning",
      shortDescription: "Practical ML systems — from data pipelines to deployed inference services.",
      description:
        "We design and deploy machine learning systems for prediction, classification, and automation — including the data pipelines, model training infrastructure, and monitoring needed to keep them reliable in production.",
      icon: "ai",
      features: ["Model development & evaluation", "Production inference pipelines", "Computer vision & NLP", "MLOps & monitoring"],
      technologies: ["Python", "PyTorch", "TensorFlow", "AWS SageMaker"],
      order: 3,
      featured: true,
    },
    {
      slug: "iot-solutions",
      title: "IoT Solutions",
      shortDescription: "Connected device systems from firmware and sensors through to cloud dashboards.",
      description:
        "We build complete IoT systems — device firmware, connectivity, cloud ingestion, and the dashboards teams use to monitor and act on the data.",
      icon: "iot",
      features: ["Sensor & device integration", "Edge-to-cloud data pipelines", "Real-time dashboards", "Device fleet management"],
      technologies: ["MQTT", "AWS IoT Core", "Python", "React"],
      order: 4,
      featured: true,
    },
    {
      slug: "robotics-automation",
      title: "Robotics & Automation",
      shortDescription: "Control systems and automation software for physical and process workflows.",
      description:
        "We design control software and automation logic for robotics and industrial process workflows, integrating sensors, actuators, and monitoring into a single coherent system.",
      icon: "robotics",
      features: ["Control system design", "Sensor & actuator integration", "Process automation logic", "Simulation & testing"],
      technologies: ["ROS", "Python", "C++"],
      order: 5,
      featured: false,
    },
    {
      slug: "cloud-solutions",
      title: "Cloud Solutions",
      shortDescription: "Cloud architecture and infrastructure that scales predictably and fails gracefully.",
      description:
        "We design and manage cloud infrastructure on AWS, GCP, and Azure — covering architecture, cost optimization, CI/CD, and reliability engineering.",
      icon: "cloud",
      features: ["Infrastructure as code", "Auto-scaling architectures", "CI/CD pipelines", "Cost & performance audits"],
      technologies: ["AWS", "Docker", "Kubernetes", "Terraform"],
      order: 6,
      featured: true,
    },
    {
      slug: "cybersecurity",
      title: "Cybersecurity",
      shortDescription: "Security reviews, hardening, and monitoring for applications and infrastructure.",
      description:
        "We assess and harden applications and infrastructure against real threats — covering secure architecture review, penetration testing, and ongoing monitoring.",
      icon: "security",
      features: ["Security architecture review", "Vulnerability assessment", "Secure authentication design", "Incident monitoring setup"],
      technologies: ["OWASP", "OAuth 2.0", "AWS Security Hub"],
      order: 7,
      featured: false,
    },
    {
      slug: "networking-solutions",
      title: "Networking Solutions",
      shortDescription: "Network architecture, VPNs, and infrastructure reliability for growing teams.",
      description:
        "We design and implement network infrastructure — from office and data-center networking to VPN architecture and monitoring for distributed teams.",
      icon: "network",
      features: ["Network architecture design", "VPN & secure remote access", "Monitoring & alerting", "Capacity planning"],
      technologies: ["Cisco", "WireGuard", "pfSense"],
      order: 8,
      featured: false,
    },
    {
      slug: "ui-ux-design",
      title: "UI/UX Design",
      shortDescription: "Interface design grounded in usability research, not just visual trends.",
      description:
        "We design interfaces that are usable first and beautiful as a consequence — backed by research, wireframing, and iterative usability testing.",
      icon: "design",
      features: ["User research & personas", "Wireframing & prototyping", "Design systems", "Usability testing"],
      technologies: ["Figma", "Framer"],
      order: 9,
      featured: false,
    },
    {
      slug: "digital-transformation",
      title: "Digital Transformation",
      shortDescription: "Modernizing legacy processes and systems without disrupting the business.",
      description:
        "We help organizations move from manual or legacy processes to modern digital systems, sequencing the transition so operations continue uninterrupted.",
      icon: "workflow",
      features: ["Process & systems audit", "Migration roadmap", "Legacy system integration", "Change management support"],
      technologies: ["APIs", "PostgreSQL", "Node.js"],
      order: 10,
      featured: false,
    },
    {
      slug: "it-consulting",
      title: "IT Consulting",
      shortDescription: "Independent technical guidance on architecture, vendors, and technology strategy.",
      description:
        "We provide independent technical guidance for teams making significant architecture, vendor, or hiring decisions — grounded in hands-on engineering experience.",
      icon: "consulting",
      features: ["Architecture review", "Technology stack evaluation", "Team & process assessment", "Roadmap planning"],
      technologies: [],
      order: 11,
      featured: false,
    },
  ] as const;

  await db.insert(schema.services).values(
    services.map((s) => ({ ...s, status: "published" as const, technologies: [...s.technologies], features: [...s.features] })),
  );
  console.log(`✓ Services (${services.length})`);

  // ---------- Technology categories & items ----------
  const techCategories = [
    { name: "Frontend", slug: "frontend", items: ["React", "Next.js", "TypeScript", "Tailwind CSS", "Vue.js"] },
    { name: "Backend", slug: "backend", items: ["Node.js", "Python", "Java", "Go", "PostgreSQL"] },
    { name: "Mobile", slug: "mobile", items: ["React Native", "Swift", "Kotlin", "Flutter"] },
    { name: "Cloud & DevOps", slug: "cloud-devops", items: ["AWS", "Docker", "Kubernetes", "Terraform", "GitHub Actions"] },
    { name: "AI / ML", slug: "ai-ml", items: ["PyTorch", "TensorFlow", "scikit-learn", "OpenAI API"] },
    { name: "IoT & Robotics", slug: "iot-robotics", items: ["MQTT", "AWS IoT Core", "ROS", "Arduino"] },
    { name: "Database", slug: "database", items: ["PostgreSQL", "MongoDB", "Redis", "Neon"] },
    { name: "Design", slug: "design", items: ["Figma", "Framer"] },
  ];

  for (let i = 0; i < techCategories.length; i++) {
    const cat = techCategories[i]!;
    const [inserted] = await db
      .insert(schema.technologyCategories)
      .values({ name: cat.name, slug: cat.slug, order: i })
      .returning();
    if (inserted) {
      await db.insert(schema.technologies).values(
        cat.items.map((name, idx) => ({ categoryId: inserted.id, name, order: idx })),
      );
    }
  }
  console.log("✓ Technology categories & items");

  // ---------- Projects ----------
  const projects = [
    {
      slug: "meridian-logistics-platform",
      title: "Meridian Logistics Platform",
      client: "Meridian Freight Co.",
      category: "Custom Software",
      summary: "A real-time freight tracking and dispatch platform replacing a decade-old spreadsheet workflow.",
      challenge: "Meridian coordinated freight dispatch across three regional offices using shared spreadsheets, causing double-bookings and delayed customer updates.",
      solution: "We built a unified dispatch platform with real-time load tracking, automated driver assignment, and a customer-facing tracking portal.",
      results: "Dispatch errors dropped by 87% and average customer response time fell from 4 hours to 12 minutes within the first quarter.",
      technologies: ["Next.js", "PostgreSQL", "AWS", "Node.js"],
      featured: true,
      order: 0,
    },
    {
      slug: "pulsecare-patient-portal",
      title: "PulseCare Patient Portal",
      client: "PulseCare Clinics",
      category: "Web Development",
      summary: "A HIPAA-aware patient portal for appointment scheduling, records access, and secure messaging.",
      challenge: "PulseCare's patients had no self-service way to book appointments or view records, driving heavy phone-line traffic across all locations.",
      solution: "We designed and built a secure patient portal with appointment scheduling, encrypted messaging, and records access integrated with their existing EHR.",
      results: "Phone-line volume dropped by 40% and online appointment bookings now account for over 60% of all scheduling.",
      technologies: ["React", "Node.js", "PostgreSQL", "AWS"],
      featured: true,
      order: 1,
    },
    {
      slug: "greenfield-iot-monitoring",
      title: "Greenfield IoT Monitoring",
      client: "Greenfield AgriTech",
      category: "IoT Solutions",
      summary: "A sensor network and dashboard for real-time soil and irrigation monitoring across 400 acres.",
      challenge: "Greenfield relied on manual soil sampling, missing early signs of irrigation issues that damaged crop yield.",
      solution: "We deployed a field-wide sensor network reporting soil moisture and temperature to a live dashboard with automated irrigation alerts.",
      results: "Water usage decreased by 22% while crop yield in monitored fields increased by 9% over one growing season.",
      technologies: ["MQTT", "AWS IoT Core", "Python", "React"],
      featured: true,
      order: 2,
    },
    {
      slug: "vantage-fraud-detection",
      title: "Vantage Fraud Detection Engine",
      client: "Vantage Payments",
      category: "AI & Machine Learning",
      summary: "A real-time transaction risk-scoring model integrated into an existing payments pipeline.",
      challenge: "Vantage's manual review process couldn't keep pace with transaction volume, leading to delayed fraud detection.",
      solution: "We trained and deployed a risk-scoring model integrated directly into their transaction pipeline, flagging high-risk transactions in under 200ms.",
      results: "Fraud losses decreased by 34% in the first six months, with false-positive review volume down 18%.",
      technologies: ["Python", "PyTorch", "AWS SageMaker"],
      featured: true,
      order: 3,
    },
    {
      slug: "northline-fleet-dashboard",
      title: "Northline Fleet Dashboard",
      client: "Northline Transit Authority",
      category: "Cloud Solutions",
      summary: "A cloud-native operations dashboard consolidating fleet telemetry from five legacy systems.",
      challenge: "Fleet data was scattered across five disconnected legacy systems, making network-wide reporting slow and error-prone.",
      solution: "We built a unified data pipeline and dashboard consolidating telemetry from all five systems into one real-time operations view.",
      results: "Monthly reporting time dropped from three days to under two hours.",
      technologies: ["AWS", "Terraform", "PostgreSQL", "React"],
      featured: false,
      order: 4,
    },
  ];

  await db.insert(schema.projects).values(
    projects.map((p) => ({ ...p, status: "published" as const, technologies: [...p.technologies] })),
  );
  console.log(`✓ Projects (${projects.length})`);

  // ---------- Training courses ----------
  const courses = [
    {
      slug: "full-stack-web-development",
      title: "Full-Stack Web Development",
      category: "Web Development",
      description: "A hands-on program covering modern frontend and backend development, from first component to deployed application.",
      duration: "16 weeks",
      level: "beginner" as const,
      technologies: ["JavaScript", "TypeScript", "React", "Next.js", "Node.js", "PostgreSQL"],
      curriculum: [
        { title: "Foundations", items: ["HTML, CSS & modern JavaScript", "Git & version control", "Responsive design"] },
        { title: "Frontend Engineering", items: ["React fundamentals", "Next.js & routing", "State management"] },
        { title: "Backend Engineering", items: ["Node.js & APIs", "PostgreSQL & data modeling", "Authentication"] },
        { title: "Capstone Project", items: ["Full-stack application build", "Deployment", "Code review & presentation"] },
      ],
      projects: ["Personal portfolio site", "Full-stack marketplace app", "Capstone team project"],
      certification: "Leo Tech Solution Certificate in Full-Stack Web Development",
      price: "1200.00",
      instructor: "Daniela Reyes",
      featured: true,
      order: 0,
    },
    {
      slug: "ai-ml-engineering",
      title: "AI/ML Engineering",
      category: "AI & Machine Learning",
      description: "Covers practical machine learning — from data preparation through training, evaluation, and deploying models to production.",
      duration: "14 weeks",
      level: "intermediate" as const,
      technologies: ["Python", "PyTorch", "scikit-learn", "AWS SageMaker"],
      curriculum: [
        { title: "ML Foundations", items: ["Python for data science", "Statistics & probability", "Data cleaning & feature engineering"] },
        { title: "Model Development", items: ["Supervised learning", "Neural networks with PyTorch", "Model evaluation"] },
        { title: "Production ML", items: ["Deployment pipelines", "Monitoring & retraining", "MLOps basics"] },
      ],
      projects: ["Classification model project", "Computer vision project", "Deployed inference API"],
      certification: "Leo Tech Solution Certificate in AI/ML Engineering",
      price: "1450.00",
      instructor: "Marcus Chen",
      featured: true,
      order: 1,
    },
    {
      slug: "python-for-data-science",
      title: "Python for Data Science",
      category: "Data Science",
      description: "Builds a strong foundation in Python, data analysis, and visualization for aspiring data professionals.",
      duration: "10 weeks",
      level: "beginner" as const,
      technologies: ["Python", "Pandas", "NumPy", "Matplotlib"],
      curriculum: [
        { title: "Python Fundamentals", items: ["Syntax & data structures", "Functions & modules"] },
        { title: "Data Analysis", items: ["Pandas & NumPy", "Data cleaning", "Exploratory analysis"] },
        { title: "Visualization", items: ["Matplotlib & Seaborn", "Dashboard basics"] },
      ],
      projects: ["Exploratory data analysis report", "Interactive dashboard"],
      certification: "Leo Tech Solution Certificate in Python for Data Science",
      price: "800.00",
      instructor: "Priya Nair",
      featured: false,
      order: 2,
    },
    {
      slug: "ui-ux-design-fundamentals",
      title: "UI/UX Design Fundamentals",
      category: "UI/UX Design",
      description: "Covers user research, wireframing, prototyping, and design systems for aspiring product designers.",
      duration: "8 weeks",
      level: "beginner" as const,
      technologies: ["Figma", "Framer"],
      curriculum: [
        { title: "Research & Strategy", items: ["User research methods", "Personas & journey mapping"] },
        { title: "Design", items: ["Wireframing", "Prototyping in Figma", "Design systems"] },
        { title: "Testing", items: ["Usability testing", "Iteration & handoff"] },
      ],
      projects: ["Mobile app redesign", "Design system starter kit"],
      certification: "Leo Tech Solution Certificate in UI/UX Design",
      price: "700.00",
      instructor: "Sofia Alvarez",
      featured: true,
      order: 3,
    },
    {
      slug: "cybersecurity-fundamentals",
      title: "Cybersecurity Fundamentals",
      category: "Cybersecurity",
      description: "Introduces core security concepts, common vulnerabilities, and practical hardening techniques.",
      duration: "10 weeks",
      level: "beginner" as const,
      technologies: ["OWASP", "Linux", "Wireshark"],
      curriculum: [
        { title: "Security Foundations", items: ["Threat modeling", "Network security basics"] },
        { title: "Application Security", items: ["OWASP Top 10", "Secure authentication"] },
        { title: "Defense & Monitoring", items: ["Incident response basics", "Monitoring & alerting"] },
      ],
      projects: ["Vulnerability assessment report", "Hardened sample application"],
      certification: "Leo Tech Solution Certificate in Cybersecurity Fundamentals",
      price: "900.00",
      instructor: "James Okafor",
      featured: false,
      order: 4,
    },
    {
      slug: "cloud-devops-engineering",
      title: "Cloud & DevOps Engineering",
      category: "Cloud & DevOps",
      description: "Covers cloud infrastructure, containerization, and CI/CD pipelines for modern application delivery.",
      duration: "12 weeks",
      level: "intermediate" as const,
      technologies: ["AWS", "Docker", "Kubernetes", "Terraform"],
      curriculum: [
        { title: "Cloud Foundations", items: ["AWS core services", "Infrastructure as code"] },
        { title: "Containers", items: ["Docker", "Kubernetes basics"] },
        { title: "CI/CD", items: ["Pipeline design", "Monitoring & rollback strategies"] },
      ],
      projects: ["Containerized application deployment", "CI/CD pipeline build"],
      certification: "Leo Tech Solution Certificate in Cloud & DevOps Engineering",
      price: "1100.00",
      instructor: "Daniela Reyes",
      featured: false,
      order: 5,
    },
  ];

  await db.insert(schema.trainingCourses).values(
    courses.map((c) => ({ ...c, status: "published" as const, technologies: [...c.technologies], curriculum: c.curriculum.map((m) => ({ title: m.title, items: [...m.items] })), projects: [...c.projects] })),
  );
  console.log(`✓ Training courses (${courses.length})`);

  // ---------- Internship programs ----------
  await db.insert(schema.internshipPrograms).values([
    {
      title: "Software Engineering Internship",
      description: "A 12-week internship where participants join a real project team building production software, mentored by senior engineers.",
      duration: "12 weeks",
      technologies: ["TypeScript", "React", "Node.js", "PostgreSQL"],
      projects: "Interns contribute directly to active client or internal product codebases under code review.",
      mentorship: "Paired with a senior engineer for weekly 1:1s and daily standups.",
      certificate: "Leo Tech Solution Certificate of Internship Completion",
      eligibility: "Completion of the Full-Stack Web Development course or equivalent experience.",
      status: "published",
      order: 0,
    },
    {
      title: "AI/ML Research Internship",
      description: "A 10-week internship focused on applied ML — dataset preparation, model experimentation, and deployment support.",
      duration: "10 weeks",
      technologies: ["Python", "PyTorch", "AWS SageMaker"],
      projects: "Interns work on a scoped model-development project with a defined evaluation benchmark.",
      mentorship: "Paired with an ML engineer for weekly reviews and pairing sessions.",
      certificate: "Leo Tech Solution Certificate of Internship Completion",
      eligibility: "Completion of the AI/ML Engineering course or equivalent portfolio.",
      status: "published",
      order: 1,
    },
  ]);
  console.log("✓ Internship programs");

  // ---------- Team members ----------
  // Real team roster; slugs are the permanent /team/{slug} profile URLs used by ID-card QR codes.
  const team = [
    { firstName: "Deepa", lastName: "Paswan", position: "CEO", department: "Management", order: 0 },
    { firstName: "Suraj", middleName: "Kumar", lastName: "Sah", position: "Managing Director", department: "Management", order: 1 },
    { firstName: "Dipesh", middleName: "Kumar", lastName: "Mahato", position: "CTO", order: 2 },
    { firstName: "Ramabtar", lastName: "Yadav", position: "HR", order: 3 },
    { firstName: "Raja", middleName: "Kumar", lastName: "Sah", position: "Full-Stack Software Engineer", order: 4 },
    { firstName: "Rahul", lastName: "Paswan", position: "Robotics Instructor", order: 5 },
  ].map((t) => {
    const name = [t.firstName, t.middleName, t.lastName].filter(Boolean).join(" ");
    return { ...t, name, slug: name.toLowerCase().replace(/[^a-z0-9]+/g, "-"), published: true, qrGeneratedAt: new Date() };
  });
  const insertedTeam = await db.insert(schema.teamMembers).values(team).onConflictDoNothing().returning();
  if (insertedTeam.length > 0) {
    await db
      .insert(schema.teamMemberSlugHistory)
      .values(insertedTeam.map((m) => ({ teamMemberId: m.id, slug: m.slug, isCurrent: true })))
      .onConflictDoNothing();
  }
  console.log(`✓ Team members (${insertedTeam.length})`);

  // ---------- Testimonials ----------
  await db.insert(schema.testimonials).values([
    { name: "Robert Chen", position: "Operations Director", company: "Meridian Freight Co.", content: "LeoTech rebuilt our dispatch process from the ground up. Errors that used to happen weekly are now rare, and our customers notice the difference.", rating: 5, order: 0, published: true },
    { name: "Dr. Amara Whitfield", position: "Clinic Administrator", company: "PulseCare Clinics", content: "The patient portal LeoTech built cut our phone volume dramatically. Their team understood the compliance requirements without us having to explain twice.", rating: 5, order: 1, published: true },
    { name: "Tobias Lindgren", position: "Operations Lead", company: "Greenfield AgriTech", content: "The monitoring system paid for itself in the first season through water savings alone. Support after launch has been excellent.", rating: 5, order: 2, published: true },
    { name: "Elena Vasquez", position: "VP of Risk", company: "Vantage Payments", content: "Their fraud model integrated cleanly into our existing pipeline with minimal disruption, and the results were measurable within weeks.", rating: 5, order: 3, published: true },
    { name: "Michael Torres", position: "Bootcamp Graduate", company: "Full-Stack Web Development", content: "The course was far more hands-on than I expected — I was working in a real codebase by week four, not just following tutorials.", rating: 5, order: 4, published: true },
  ]);
  console.log("✓ Testimonials");

  // ---------- Blog categories & tags ----------
  const categories = [
    { name: "Engineering", slug: "engineering" },
    { name: "AI & ML", slug: "ai-ml" },
    { name: "Cloud", slug: "cloud" },
    { name: "Career", slug: "career" },
    { name: "Company News", slug: "company-news" },
  ];
  const categoryRows = await db.insert(schema.blogCategories).values(categories).returning();

  const tags = ["React", "Next.js", "Python", "AWS", "Security", "Training", "Careers"].map((name) => ({
    name,
    slug: name.toLowerCase(),
  }));
  const tagRows = await db.insert(schema.blogTags).values(tags).returning();
  console.log("✓ Blog categories & tags");

  const byCatSlug = (slug: string) => categoryRows.find((c) => c.slug === slug)!.id;
  const tagIdByName = (name: string) => tagRows.find((t) => t.name === name)!.id;

  const posts = [
    {
      slug: "why-we-chose-postgres-over-a-nosql-database",
      title: "Why We Default to PostgreSQL Over a NoSQL Database",
      excerpt: "For most application workloads, a well-modeled relational database beats a document store — here's our reasoning.",
      content:
        "<p>When teams reach for a NoSQL database by default, it's usually because of a perceived need for flexibility. In practice, most application data has real relationships and benefits from constraints that a relational database enforces at write time rather than discovering violations later.</p><p>PostgreSQL in particular gives us the best of both worlds: strong relational guarantees alongside JSONB columns for genuinely flexible fields. We reach for a document store only when the access pattern is truly key-based with no relational structure.</p><p>This is the same reasoning behind the schema powering this site — normalized tables for structured content, JSONB only where flexibility genuinely earns its keep.</p>",
      categorySlug: "engineering",
      tagNames: ["React", "AWS"],
      featured: true,
    },
    {
      slug: "deploying-ml-models-without-the-drama",
      title: "Deploying ML Models Without the Drama",
      excerpt: "Model deployment fails most often from process gaps, not algorithm choice. Here's the checklist we use on every project.",
      content:
        "<p>Most production ML incidents we've debugged had nothing to do with model architecture — they came from missing input validation, silent data drift, or a training/serving skew nobody caught before launch.</p><p>Our deployment checklist starts before the first line of serving code: define the input contract, log every prediction with its inputs, and set explicit thresholds for when a model needs retraining.</p><p>Treat the model as one component in a larger system with the same rigor you'd apply to any other service — versioned, monitored, and rollback-ready.</p>",
      categorySlug: "ai-ml",
      tagNames: ["Python", "AWS"],
      featured: true,
    },
    {
      slug: "a-practical-guide-to-cloud-cost-audits",
      title: "A Practical Guide to Cloud Cost Audits",
      excerpt: "Most cloud bills have 20-30% of avoidable spend hiding in a handful of predictable places. Here's where to look first.",
      content:
        "<p>Before recommending any architecture changes, we run a cost audit covering idle resources, oversized instances, and data transfer patterns — in that order, since they're usually the largest and easiest wins.</p><p>Idle load balancers and unattached storage volumes are the most common offenders we find, followed by instances sized for peak load that run oversized around the clock.</p><p>A cost audit isn't a one-time exercise — we set up ongoing tagging and budget alerts so the savings compound rather than reset after six months.</p>",
      categorySlug: "cloud",
      tagNames: ["AWS"],
      featured: false,
    },
    {
      slug: "what-we-look-for-in-a-bootcamp-graduate",
      title: "What We Actually Look For in a Bootcamp Graduate",
      excerpt: "Hiring from our own training academy taught us that portfolio depth matters more than course completion.",
      content:
        "<p>Having run our own training academy for several years now, we've hired a number of our own graduates — and the pattern that predicts success isn't which courses someone completed, it's how deeply they engaged with the capstone project.</p><p>Candidates who can explain a tradeoff they made under a real constraint stand out immediately from those who can only describe what a tutorial told them to build.</p><p>This is part of why every LeoTech course ends in a real project with code review, not a multiple-choice exam.</p>",
      categorySlug: "career",
      tagNames: ["Training", "Careers"],
      featured: false,
    },
    {
      slug: "securing-an-api-without-slowing-your-team-down",
      title: "Securing an API Without Slowing Your Team Down",
      excerpt: "Security reviews don't have to be a bottleneck. Here's how we integrate them into a normal sprint cadence.",
      content:
        "<p>The biggest obstacle to good API security isn't technical — it's that security review often happens too late, as a gate right before launch, when fixing anything is expensive.</p><p>We instead review authentication and authorization design during architecture planning, before implementation starts, and run automated dependency and static analysis scans on every pull request.</p><p>Treated this way, security stops being a separate phase and becomes part of the normal engineering process.</p>",
      categorySlug: "engineering",
      tagNames: ["Security"],
      featured: false,
    },
    {
      slug: "leotech-opens-applications-for-spring-internship-cohort",
      title: "LeoTech Opens Applications for the Spring Internship Cohort",
      excerpt: "Applications are now open for our Software Engineering and AI/ML Research internship programs.",
      content:
        "<p>We're opening applications for our upcoming internship cohort across both the Software Engineering and AI/ML Research tracks. Both programs place interns directly onto active project teams under the mentorship of senior engineers.</p><p>Eligibility and application details are on our Internships page — we review applications on a rolling basis and recommend applying early, as cohort sizes are limited to keep the mentorship ratio meaningful.</p>",
      categorySlug: "company-news",
      tagNames: ["Careers", "Training"],
      featured: false,
    },
  ];

  for (const post of posts) {
    const [inserted] = await db
      .insert(schema.blogPosts)
      .values({
        slug: post.slug,
        title: post.title,
        excerpt: post.excerpt,
        content: post.content,
        categoryId: byCatSlug(post.categorySlug),
        readingTimeMinutes: Math.max(1, Math.round(post.content.replace(/<[^>]*>/g, " ").split(/\s+/).length / 200)),
        featured: post.featured,
        status: "published",
        publishedAt: new Date(),
      })
      .returning();
    if (inserted) {
      await db.insert(schema.blogPostTags).values(
        post.tagNames.map((name) => ({ postId: inserted.id, tagId: tagIdByName(name) })),
      );
    }
  }
  console.log(`✓ Blog posts (${posts.length})`);

  // ---------- Job openings ----------
  await db.insert(schema.jobOpenings).values([
    {
      slug: "senior-full-stack-engineer",
      title: "Senior Full-Stack Engineer",
      department: "Engineering",
      location: "San Francisco, CA (Hybrid)",
      employmentType: "full-time",
      description: "We're looking for a senior full-stack engineer to lead client engagements spanning architecture, implementation, and delivery.",
      responsibilities: ["Lead architecture decisions on client projects", "Mentor mid-level engineers", "Own delivery from planning through deployment"],
      requirements: ["5+ years professional software engineering experience", "Strong TypeScript/Node.js and React experience", "Experience with PostgreSQL and cloud infrastructure"],
      benefits: ["Health, dental & vision coverage", "Flexible hybrid schedule", "Professional development budget"],
      applicationInstructions: "Send your resume and portfolio to careers@leotechsolution.com.",
      status: "open",
    },
    {
      slug: "machine-learning-engineer",
      title: "Machine Learning Engineer",
      department: "AI/ML",
      location: "Remote (US)",
      employmentType: "full-time",
      description: "Join our AI/ML team building and deploying production machine learning systems for client projects.",
      responsibilities: ["Design and train models for client use cases", "Build production inference pipelines", "Collaborate with engineering on integration"],
      requirements: ["3+ years applied ML experience", "Strong Python and PyTorch or TensorFlow skills", "Experience deploying models to production"],
      benefits: ["Health, dental & vision coverage", "Fully remote", "Professional development budget"],
      applicationInstructions: "Send your resume and portfolio to careers@leotechsolution.com.",
      status: "open",
    },
    {
      slug: "technical-training-instructor",
      title: "Technical Training Instructor (Part-Time)",
      department: "Training Academy",
      location: "San Francisco, CA (Hybrid)",
      employmentType: "part-time",
      description: "Teach one or more courses in our training academy, combining live instruction with project mentorship.",
      responsibilities: ["Deliver course curriculum through live sessions", "Mentor students through capstone projects", "Provide code review and feedback"],
      requirements: ["3+ years professional experience in the subject area", "Prior teaching or mentorship experience preferred", "Strong communication skills"],
      benefits: ["Competitive hourly rate", "Flexible scheduling", "Access to LeoTech engineering resources"],
      applicationInstructions: "Send your resume and a brief teaching statement to careers@leotechsolution.com.",
      status: "open",
    },
    {
      slug: "junior-frontend-developer",
      title: "Junior Frontend Developer",
      department: "Engineering",
      location: "San Francisco, CA (Hybrid)",
      employmentType: "full-time",
      description: "An entry-level role for a recent graduate or bootcamp alum ready to work on real client projects under senior mentorship.",
      responsibilities: ["Implement UI components from design specs", "Participate in code review", "Collaborate with design and backend engineers"],
      requirements: ["Solid fundamentals in JavaScript, HTML & CSS", "Familiarity with React", "A portfolio of project work"],
      benefits: ["Health, dental & vision coverage", "Mentorship program", "Professional development budget"],
      applicationInstructions: "Send your resume and portfolio to careers@leotechsolution.com.",
      status: "open",
    },
  ]);
  console.log("✓ Job openings");

  // ---------- Admin user ----------
  const adminEmail = "maurimoor8@gmail.com";
  const existingAdmin = await db.query.adminUsers.findFirst({
    where: (u, { eq }) => eq(u.email, adminEmail),
  });

  if (!existingAdmin) {
    const tempPassword = randomBytes(9).toString("base64url");
    const passwordHash = await bcrypt.hash(tempPassword, 12);
    await db.insert(schema.adminUsers).values({
      name: "LeoTech Owner",
      email: adminEmail,
      passwordHash,
      role: "owner",
    });
    console.log("\n✓ Admin user created:");
    console.log(`   Email:    ${adminEmail}`);
    console.log(`   Password: ${tempPassword}`);
    console.log("   (Change this password immediately after first login — it will not be shown again.)");
  } else {
    console.log("\n— Admin user already exists, skipped.");
  }

  console.log("\nSeed complete.");
  await pool.end();
}

main().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
