import { useState } from "react";

export default function Builder() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    skills: "",
    education: "",
    experience: "",
    projects: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>Resume Builder</h1>

      <input
        type="text"
        name="name"
        placeholder="Name"
        onChange={handleChange}
      />

      <br /><br />

      <input
        type="email"
        name="email"
        placeholder="Email"
        onChange={handleChange}
      />

      <br /><br />

      <textarea
        name="skills"
        placeholder="Skills"
        onChange={handleChange}
      />

      <br /><br />

      <textarea
        name="education"
        placeholder="Education"
        onChange={handleChange}
      />

      <br /><br />

      <textarea
        name="experience"
        placeholder="Experience"
        onChange={handleChange}
      />

      <br /><br />

      <textarea
        name="projects"
        placeholder="Projects"
        onChange={handleChange}
      />

      <hr />

      <h2>Live Preview</h2>

      <p><strong>Name:</strong> {formData.name}</p>
      <p><strong>Email:</strong> {formData.email}</p>
      <p><strong>Skills:</strong> {formData.skills}</p>
      <p><strong>Education:</strong> {formData.education}</p>
      <p><strong>Experience:</strong> {formData.experience}</p>
      <p><strong>Projects:</strong> {formData.projects}</p>
    </div>
  );
}