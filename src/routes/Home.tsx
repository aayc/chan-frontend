import {
    ArrowUpRight,
    Github,
    Linkedin,
    Mail,
    Brain,
    Cpu,
    FileText,
    Briefcase,
    Code,
    Globe,
    Server,
} from "lucide-react"
import aaronJpeg from "../assets/aaron.jpeg";
import harveyAiLogoJpeg from "../assets/logos/harvey_ai_logo.jpeg";
import microsoftLogoPng from "../assets/logos/Microsoft_logo.png";
import tiedyeLogoJpg from "../assets/logos/tiedye_logo.JPG";
import whatsappLogoPng from "../assets/logos/whatsapp_logo.png";

export default function Home() {
    return (
        <div className="min-h-screen bg-slate-50 overflow-x-hidden">
            {/* Fixed Side Navigation */}
            <nav className="fixed left-0 top-0 h-full w-20 bg-white border-r border-gray-200 flex-col items-center py-8 z-50 hidden md:flex">
                <div className="mb-12">
                    <div className="w-10 h-10 bg-gradient-to-br from-violet-600 to-indigo-600 rounded-xl flex items-center justify-center text-white font-bold">
                        AC
                    </div>
                </div>
                <div className="flex flex-col gap-6">
                    {[
                        { icon: Cpu, label: "Projects" },
                        { icon: Briefcase, label: "Experience" },
                        { icon: FileText, label: "Research" },
                        { icon: Mail, label: "Contact" },
                        { icon: Brain, label: "App" },
                    ].map((item, index) => (
                        <a
                            key={index}
                            href={`${item.label === 'App' ? '/ledger' : '#' + item.label.toLowerCase()}`}
                            className="w-12 h-12 rounded-xl flex items-center justify-center text-gray-400 hover:text-violet-600 hover:bg-violet-50 transition-all group relative"
                        >
                            <item.icon className="w-5 h-5" />
                            <span className="absolute left-16 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                {item.label}
                            </span>
                        </a>
                    ))}
                </div>
            </nav>

            {/* Main Content Area */}
            <div className="md:ml-20 p-8">
                {/* Hero Bento Grid */}
                <div className="max-w-7xl mx-auto mb-16">
                    <div className="grid grid-cols-12 gap-6 auto-rows-[120px]">
                        {/* Main Hero Card (Updated with Avatar) */}
                        <div className="col-span-12 md:col-span-8 row-span-3 bg-gradient-to-br from-violet-600 to-indigo-600 rounded-3xl p-8 text-white relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -mr-48 -mt-48"></div>
                            <div className="relative z-10 h-full flex flex-col justify-between">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h1 className="text-3xl font-bold mb-4">Hi, I'm Aaron</h1>
                                        <p className="text-lg text-white/90 max-w-md">
                                            Applied AI Researcher bridging cutting-edge research with practical industry solutions.
                                        </p>
                                    </div>
                                    <img
                                        src={aaronJpeg}
                                        alt="Aaron Chan Avatar"
                                        className="w-48 h-48 rounded-full object-cover border-4 border-white/20 flex-shrink-0 hidden md:flex"
                                    />
                                </div>
                                <div className="flex gap-4 mt-auto">
                                    <a href="#projects">
                                        <button className="bg-white text-violet-600 hover:bg-white/90 px-4 py-2 rounded-md flex items-center">
                                            View Projects <ArrowUpRight className="ml-2 h-4 w-4" />
                                        </button>
                                    </a>
                                    <a href="src/assets/Aaron_Chan_Resume.pdf" download>
                                        <button className="bg-white text-violet-600 hover:bg-white/90 px-4 py-2 rounded-md flex items-center">
                                            Download Resume <ArrowUpRight className="ml-2 h-4 w-4" />
                                        </button>
                                    </a>
                                    <a href="#contact">
                                        <button className="border-white text-violet-600 hover:bg-white/10 border px-4 py-2 rounded-md flex items-center">
                                            Contact Me
                                        </button>
                                    </a>
                                </div>
                            </div>
                        </div>

                        {/* Writing Section */}
                        <div className="col-span-12 md:col-span-4 row-span-3 bg-white rounded-3xl p-6 hover:shadow-lg transition-shadow flex flex-col">
                            <h3 className="font-semibold text-lg text-gray-900 mb-4 flex items-center">
                                <FileText className="w-5 h-5 mr-2 text-violet-600" />
                                Writing
                            </h3>
                            <div className="space-y-3">
                                <div>
                                    <h4 className="font-medium text-gray-800 hover:text-violet-600 text-sm">
                                        <a href="#">Title of My First Amazing Blog Post</a>
                                    </h4>
                                    <p className="text-xs text-gray-500">Jan 1, 2024</p>
                                </div>
                                <div>
                                    <h4 className="font-medium text-gray-800 hover:text-violet-600 text-sm">
                                        <a href="#">Exploring New Concepts in AI</a>
                                    </h4>
                                    <p className="text-xs text-gray-500">Feb 15, 2024</p>
                                </div>
                                <div>
                                    <h4 className="font-medium text-gray-800 hover:text-violet-600 text-sm">
                                        <a href="#">A Guide to Modern Web Development</a>
                                    </h4>
                                    <p className="text-xs text-gray-500">Mar 30, 2024</p>
                                </div>
                                <div>
                                    <h4 className="font-medium text-gray-800 hover:text-violet-600 text-sm">
                                        <a href="#">Deep Dive into Transformers</a>
                                    </h4>
                                    <p className="text-xs text-gray-500">Apr 20, 2024</p>
                                </div>
                            </div>
                        </div>

                        {/* Company Cards (Existing) */}
                        <div className="col-span-6 md:col-span-3 row-span-2 bg-white rounded-3xl p-6 flex flex-col justify-center items-center text-center hover:shadow-lg transition-shadow">
                            <div className="w-12 h-12 bg-violet-100 rounded-xl flex items-center justify-center mb-3">
                                <img
                                    src={harveyAiLogoJpeg}
                                    alt="Harvey Logo"
                                    width={30}
                                    height={30}
                                    className="object-contain"
                                />
                            </div>
                            <p className="font-semibold text-gray-900">Harvey</p>
                            <p className="text-sm text-gray-600">Senior Engineer, Applied AI Research</p>
                            <p className="text-xs text-gray-500 mt-1">Feb 2024 - Present</p>
                        </div>

                        <div className="col-span-6 md:col-span-3 row-span-2 bg-white rounded-3xl p-6 flex flex-col justify-center items-center text-center hover:shadow-lg transition-shadow">
                            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-3">
                                <img
                                    src={microsoftLogoPng}
                                    alt="Microsoft Research Logo"
                                    width={30}
                                    height={30}
                                    className="object-contain"
                                />
                            </div>
                            <p className="font-semibold text-gray-900">Microsoft Research</p>
                            <p className="text-sm text-gray-600">AI/ML Engineering</p>
                            <p className="text-xs text-gray-500 mt-1">Sep 2021 - Feb 2024</p>
                        </div>

                        {/* New Company Cards (Replacing old Current Focus spot) */}
                        <div className="col-span-6 md:col-span-3 row-span-2 bg-white rounded-3xl p-6 flex flex-col justify-center items-center text-center hover:shadow-lg transition-shadow">
                            <div className="w-12 h-12 bg-pink-100 rounded-xl flex items-center justify-center mb-3">
                                <img
                                    src={tiedyeLogoJpg}
                                    alt="Tiedye Logo"
                                    width={30}
                                    height={30}
                                    className="object-contain"
                                />
                            </div>
                            <p className="font-semibold text-gray-900">Tiedye</p>
                            <p className="text-sm text-gray-600">Founder, Chief Technology Officer</p>
                            <p className="text-xs text-gray-500 mt-1">Jan 2021 - Jan 2022</p>
                        </div>

                        <div className="col-span-6 md:col-span-3 row-span-2 bg-white rounded-3xl p-6 flex flex-col justify-center items-center text-center hover:shadow-lg transition-shadow">
                            <div className="w-12 h-12 bg-teal-100 rounded-xl flex items-center justify-center mb-3">
                                <img
                                    src={whatsappLogoPng}
                                    alt="Whatsapp Logo"
                                    width={30}
                                    height={30}
                                    className="object-contain"
                                />
                            </div>
                            <p className="font-semibold text-gray-900">Whatsapp</p>
                            <p className="text-sm text-gray-600">Software Engineer Intern</p>
                            <p className="text-xs text-gray-500 mt-1">Winter 2020</p>
                        </div>
                    </div>
                </div>

                {/* Projects Grid */}
                <div className="max-w-7xl mx-auto mb-16">
                    <h2 className="text-3xl font-bold mb-8 flex items-center" id="projects">
                        <span className="w-12 h-1 bg-violet-600 mr-4"></span>
                        Projects
                    </h2>

                    <div className="grid grid-cols-12 gap-6 auto-rows-[100px]">
                        {/* Featured Project */}
                        <div className="col-span-12 md:col-span-8 row-span-3 bg-white rounded-3xl p-8 relative overflow-hidden group hover:shadow-lg transition-shadow">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-violet-100 rounded-full blur-2xl opacity-50"></div>
                            <div className="relative">
                                <div className="flex items-center gap-2 mb-4">
                                    <span className="px-3 py-1 bg-violet-100 text-violet-700 rounded-full text-sm font-medium">
                                        Featured
                                    </span>
                                    <span className="text-sm text-gray-500">Harvey</span>
                                </div>
                                <h3 className="text-2xl font-bold text-gray-900 mb-3">Legal Document Analysis Platform</h3>
                                <p className="text-gray-600 mb-6">
                                    An AI-powered platform that automatically extracts, categorizes, and summarizes key information from
                                    complex legal documents, saving attorneys hundreds of hours of manual review.
                                </p>
                                <div className="flex items-center gap-4">
                                    <a href="#" className="text-violet-600 hover:text-violet-700 flex items-center font-medium">
                                        Case Study <ArrowUpRight className="ml-1 h-4 w-4" />
                                    </a>
                                    <a href="#" className="text-gray-600 hover:text-gray-900 flex items-center">
                                        <Globe className="mr-1 h-4 w-4" /> Live Demo
                                    </a>
                                </div>
                            </div>
                        </div>

                        {/* Project Cards */}
                        <div className="col-span-12 md:col-span-4 row-span-3 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-3xl p-6 text-white relative overflow-hidden">
                            <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-white/20 rounded-full"></div>
                            <h4 className="text-lg font-semibold mb-3">Contract Intelligence Engine</h4>
                            <p className="text-white/90 mb-4">
                                NLP system that identifies risks, obligations, and opportunities in legal contracts with 94% accuracy.
                            </p>
                            <div className="flex gap-2 mb-4 flex-wrap">
                                {["NLP", "Legal Tech", "Classification"].map((tag, i) => (
                                    <span key={i} className="px-2 py-1 bg-white/20 rounded-full text-xs">
                                        {tag}
                                    </span>
                                ))}
                            </div>
                            <a href="#" className="text-white/90 hover:text-white flex items-center text-sm font-medium">
                                Learn more <ArrowUpRight className="ml-1 h-3 w-3" />
                            </a>
                        </div>

                        {/* More Project Cards */}
                        <div className="col-span-6 md:col-span-4 row-span-2 bg-white rounded-3xl p-6 border-2 border-gray-100 hover:border-violet-200 transition-colors">
                            <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center mb-3">
                                <Server className="w-5 h-5 text-green-600" />
                            </div>
                            <h4 className="font-semibold text-gray-900 mb-1">ML Pipeline Optimization</h4>
                            <p className="text-sm text-gray-600">Reduced inference time by 60% for production models</p>
                        </div>

                        <div className="col-span-6 md:col-span-4 row-span-2 bg-white rounded-3xl p-6 border-2 border-gray-100 hover:border-violet-200 transition-colors">
                            <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center mb-3">
                                <Globe className="w-5 h-5 text-orange-600" />
                            </div>
                            <h4 className="font-semibold text-gray-900 mb-1">Multilingual Document Classifier</h4>
                            <p className="text-sm text-gray-600">Supporting 12 languages with a single model</p>
                        </div>

                        <div className="col-span-12 md:col-span-4 row-span-2 bg-white rounded-3xl p-6 border-2 border-gray-100 hover:border-violet-200 transition-colors">
                            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center mb-3">
                                <Code className="w-5 h-5 text-blue-600" />
                            </div>
                            <h4 className="font-semibold text-gray-900 mb-1">Open Source NLP Library</h4>
                            <p className="text-sm text-gray-600">
                                Contributed to and maintained a library for legal text processing with 2k+ GitHub stars
                            </p>
                        </div>

                    </div>
                </div>

                {/* Research & Experience */}
                <div className="max-w-7xl mx-auto mb-16">
                    <div className="grid grid-cols-12 gap-6">
                        {/* Research Section */}
                        <div className="col-span-12 md:col-span-6 bg-white rounded-3xl p-8" id="research">
                            <h2 className="text-2xl font-bold mb-6 flex items-center">
                                <FileText className="w-6 h-6 mr-2 text-violet-600" />
                                Publications
                            </h2>
                            <div className="space-y-6">
                                {[
                                    {
                                        title: "Efficient Transformer Models for Legal Document Processing",
                                        conference: "ACL 2023",
                                        citations: 18,
                                    },
                                    {
                                        title: "Explainable AI for Contract Analysis",
                                        conference: "EMNLP 2022",
                                        citations: 24,
                                    },
                                    {
                                        title: "Few-Shot Learning for Legal Case Classification",
                                        conference: "NAACL 2021",
                                        citations: 36,
                                    },
                                ].map((pub, index) => (
                                    <div key={index} className="group relative">
                                        <div className="absolute inset-0 bg-gradient-to-r from-violet-500 to-indigo-500 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                        <div className="relative bg-gray-50 rounded-xl p-4 group-hover:border-transparent transition-colors">
                                            <div className="flex justify-between items-start mb-2">
                                                <h4 className="font-semibold text-gray-900 group-hover:text-white transition-colors flex-1 mr-4 text-sm">
                                                    {pub.title}
                                                </h4>
                                                <span className="px-2 py-1 bg-violet-100 text-violet-700 rounded-full text-xs font-medium group-hover:bg-white group-hover:text-violet-700 transition-colors">
                                                    {pub.citations}
                                                </span>
                                            </div>
                                            <p className="text-xs text-gray-600 mb-2 group-hover:text-white/90 transition-colors">
                                                {pub.conference}
                                            </p>
                                            <a
                                                href="#"
                                                className="text-xs text-violet-600 hover:text-violet-700 group-hover:text-white transition-colors"
                                            >
                                                Read Paper →
                                            </a>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Experience Section */}
                        <div className="col-span-12 md:col-span-6 bg-white rounded-3xl p-8" id="experience">
                            <h2 className="text-2xl font-bold mb-6 flex items-center">
                                <Briefcase className="w-6 h-6 mr-2 text-violet-600" />
                                Experience
                            </h2>
                            <div className="space-y-6">
                                {[
                                    {
                                        company: "Harvey",
                                        role: "Senior Engineer, Applied AI Research",
                                        period: "February 2024 - Present",
                                        description:
                                            "Led development of Harvey Citations & CitationBench. Spearheaded a flagship workflow with Allen & Overy Shearman and productionized novel .docx manipulation techniques.",
                                        color: "violet",
                                    },
                                    {
                                        company: "Microsoft Research",
                                        role: "AI/ML Software Engineer",
                                        period: "September 2021 - February 2024",
                                        description:
                                            "Filed 7 patents, architected Github Copilot's Evaluation Framework, trained a security vulnerability detection model for Copilot, and led development of LLM-based bug fixing tools.",
                                        color: "blue",
                                    },
                                    {
                                        company: "Tiedye",
                                        role: "Founder, Chief Technology Officer",
                                        period: "Jan 2021 - Jan 2022",
                                        description:
                                            "Designed, built, and maintained a social network for university students, growing user base daily.",
                                        color: "pink",
                                    },
                                    {
                                        company: "Facebook (WhatsApp)",
                                        role: "Software Engineer Intern",
                                        period: "Winter 2020",
                                        description:
                                            "Designed a distributed testing framework reducing test time by 95% and a system measuring real-time message redundancy for 100B+ daily messages.",
                                        color: "green",
                                    },
                                ].map((exp, index) => (
                                    <div key={index} className="relative pl-6 border-l-2 border-gray-200">
                                        <div className={`absolute left-[-8px] top-0 w-3.5 h-3.5 rounded-full bg-${exp.color}-500`}></div>
                                        <div className="mb-1 flex justify-between">
                                            <h4 className="font-semibold text-gray-900">{exp.company}</h4>
                                            <span className="text-sm text-gray-500">{exp.period}</span>
                                        </div>
                                        <p className="text-sm text-violet-600 mb-2">{exp.role}</p>
                                        <p className="text-sm text-gray-600">{exp.description}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Skills & Contact */}
                <div className="max-w-7xl mx-auto mb-16">
                    <div className="grid grid-cols-12 gap-6">
                        {/* Skills Section */}
                        <div className="col-span-12 md:col-span-7 bg-white rounded-3xl p-8">
                            <h2 className="text-2xl font-bold mb-6">Technical Skills</h2>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                {[
                                    { category: "Languages", skills: ["Python", "TypeScript", "SQL"] },
                                    { category: "ML/AI", skills: ["PyTorch", "TensorFlow", "Hugging Face", "spaCy"] },
                                    { category: "Cloud", skills: ["Azure ML", "AWS SageMaker", "Docker", "Kubernetes"] },
                                    { category: "Data", skills: ["Pandas", "Spark", "Elasticsearch", "PostgreSQL"] },
                                    { category: "DevOps", skills: ["CI/CD", "MLOps", "Monitoring", "Testing"] },
                                    { category: "Domains", skills: ["NLP", "Legal Tech", "Document Analysis"] },
                                ].map((skillGroup, index) => (
                                    <div key={index} className="bg-gray-50 p-4 rounded-xl">
                                        <h3 className="text-sm font-medium text-gray-900 mb-2">{skillGroup.category}</h3>
                                        <div className="flex flex-wrap gap-2">
                                            {skillGroup.skills.map((skill, i) => (
                                                <span
                                                    key={i}
                                                    className="px-2 py-1 bg-white border border-gray-200 rounded-full text-xs text-gray-700"
                                                >
                                                    {skill}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Contact Section */}
                        <div
                            className="col-span-12 md:col-span-5 bg-gradient-to-br from-violet-600 to-indigo-600 rounded-3xl p-8 text-white"
                            id="contact"
                        >
                            <h2 className="text-2xl font-bold mb-6">Get In Touch</h2>
                            <p className="text-white/90 mb-6">
                                Interested in collaborating on applied AI research or discussing potential projects? Let's connect!
                            </p>
                            <div className="space-y-4">
                                <a
                                    href="mailto:aaron.y.chan.intake@gmail.com"
                                    className="flex items-center gap-3 p-4 bg-white/10 text-violet-300 rounded-2xl hover:bg-white/20 transition-colors"
                                >
                                    <Mail className="w-5 h-5 text-white" />
                                    <span className="text-white">aaron.y.chan.intake@gmail.com</span>
                                </a>
                                <a
                                    href="https://www.linkedin.com/in/aaron-y-chan/"
                                    className="flex items-center gap-3 p-4 bg-white/10 text-violet-300 rounded-2xl hover:bg-white/20 transition-colors"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    <Linkedin className="w-5 h-5 text-white" />
                                    <span className="text-white">LinkedIn</span>
                                </a>
                                <a
                                    href="https://github.com/aayc"
                                    className="flex items-center gap-3 p-4 bg-white/10 text-violet-300 rounded-2xl hover:bg-white/20 transition-colors"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    <Github className="w-5 h-5 text-white" />
                                    <span className="text-white">GitHub</span>
                                </a>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <footer className="max-w-7xl mx-auto text-center text-gray-500 text-sm py-8">
                    <p>© {new Date().getFullYear()} Aaron Chan. All rights reserved.</p>
                </footer>
            </div>
        </div>
    )
} 