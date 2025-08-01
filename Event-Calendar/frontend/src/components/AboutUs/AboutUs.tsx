import { motion } from "framer-motion";
import { FaGithub, FaLinkedin, FaUsersCog, FaTools } from "react-icons/fa";
import { SectionTitle } from "../SectionTitle/SectionTitle";

const team = [
  {
    name: "Vasil Puhalev",
    image: "/team/Vasko.jpg",
    github: "https://github.com/vPuhalev",
    linkedin: "https://www.linkedin.com/in/vasil-puhalev/",
  },
  {
    name: "Krasi Kostadinov",
    image: "/team/01.jpg",
    github: "https://github.com/gamebred97",
    linkedin: "https://www.linkedin.com/in/krasi-kostadinov",
  },
  {
    name: "Savina Brankova",
    image: "/team/Savi.jpg",
    github: "https://github.com/savinaBrankova",
    linkedin: "https://www.linkedin.com/in/savinabrankova",
  },
];
const technologies = [
  // Core / Platform
  {
    name: "TypeScript",
    logo: "https://upload.wikimedia.org/wikipedia/commons/4/4c/Typescript_logo_2020.svg",
  },
  {
    name: "Node.js",
    logo: "https://cdn.simpleicons.org/nodedotjs",
  },

  // UI & Interactivity
  {
    name: "React",
    logo: "https://upload.wikimedia.org/wikipedia/commons/a/a7/React-icon.svg",
  },
  {
    name: "Tailwind CSS",
    logo: "https://upload.wikimedia.org/wikipedia/commons/d/d5/Tailwind_CSS_Logo.svg",
  },
  {
    name: "Framer Motion",
    logo: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/framermotion/framermotion-original.svg",
  },
  {
    name: "React Router DOM",
    logo: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/reactrouter/reactrouter-original.svg",
  },
  {
    name: "Axios",
    logo: "https://axios-http.com/assets/logo.svg",
  },
  {
    name: "React Hook Form",
    logo: "/logos/react-hook-form-logo-only.png",
  },
  {
    name: "React Icons",
    logo: "https://raw.githubusercontent.com/react-icons/react-icons/master/react-icons.svg",
  },
  {
    name: "Lucide React",
    logo: "https://lucide.dev/logo.svg",
  },
  {
    name: "React Spinners",
    logo: "/logos/react-spinners-logo.svg",
  },
  {
    name: "Leaflet",
    logo: "/logos/leaflet-logo.png",
  },
  {
    name: "React Leaflet",
    logo: "https://react-leaflet.js.org/img/logo.svg",
  },
  {
    name: "Moment.js",
    logo: "/logos/moment js.jpg",
  },
  {
    name: "Day.js",
    logo: "/logos/dayJs.png",
  },

  // Server & API
  {
    name: "Express.js",
    logo: "https://cdn.simpleicons.org/express",
  },

  // Data Storage
  {
    name: "Firebase",
    logo: "https://firebase.google.com/images/brand-guidelines/logo-vertical.png",
  },

  // Infrastructure & Deployment
  {
    name: "GitHub",
    logo: "https://cdn.simpleicons.org/github",
  },
  {
    name: "Render",
    logo: "https://cdn.simpleicons.org/render",
  },

  // Dev Tools & Utilities
  {
    name: "Vite",
    logo: "vite.svg",
  },
  {
    name: "ESLint",
    logo: "https://cdn.simpleicons.org/eslint",
  },
  {
    name: "npm",
    logo: "https://cdn.simpleicons.org/npm",
  },
  {
    name: "VS Code",
    logo: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/vscode/vscode-original.svg",
  },
];

export default function AboutUsPage() {
  return (
    <div className="max-w-6xl mx-auto p-6 text-gray-800">
      <section className="text-center mb-12">
        <h1 className="text-4xl font-extrabold mb-4 text-blue-700">About Us</h1>
        <p className="text-lg text-gray-600 max-w-xl mx-auto">
          We're a small but mighty team building a collaborative calendar
          experience with modern tools.
        </p>
      </section>

      <section className="mb-20">
        <SectionTitle icon={<FaUsersCog size={28} />} title="Meet the Team" />
        <div className="grid md:grid-cols-3 gap-8">
          {team.map((member, index) => (
            <motion.div
              key={member.name}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.15 }}
              viewport={{ once: true }}
              className="bg-white border border-gray-200 rounded-xl shadow-md p-6 text-center hover:shadow-xl transition transform hover:-translate-y-1"
            >
              <img
                src={member.image}
                alt={member.name}
                className="w-24 h-24 object-cover rounded-full mx-auto mb-4 border-2 border-blue-500"
              />
              <h3 className="text-lg font-semibold text-gray-900">
                {member.name}
              </h3>
              <div className="flex justify-center gap-4 mt-2">
                <a
                  href={member.github}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <FaGithub
                    className="text-gray-700 hover:text-black"
                    size={20}
                  />
                </a>
                {member.linkedin && (
                  <a
                    href={member.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <FaLinkedin
                      className="text-blue-600 hover:text-blue-800"
                      size={20}
                    />
                  </a>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="mb-20">
        <SectionTitle
          icon={<FaTools size={28} />}
          title="Technologies We Use"
        />
        <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {technologies.map((tech) => (
            <div key={tech.name} className="flex flex-col items-center">
              <img src={tech.logo} alt={tech.name} className="w-16 h-16 mb-2" />
              <p className="text-center text-sm text-gray-600">{tech.name}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
