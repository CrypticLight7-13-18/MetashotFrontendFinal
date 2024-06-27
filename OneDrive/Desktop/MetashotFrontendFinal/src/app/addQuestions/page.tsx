"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import Navbarn from "../../Components/Navbarn";
import Sidebarn from "../../Components/SidebarN";

interface Category {
  name: string;
  questions: string[];
}

const AskQuestions = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [newQuestion, setNewQuestion] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [newCategory, setNewCategory] = useState<string>("");
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState<boolean>(false);
  const [categoryToDelete, setCategoryToDelete] = useState<string>("");

  useEffect(() => {
    const storedSkillsStr = localStorage.getItem("skills");
    if (storedSkillsStr) {
      const storedSkills = JSON.parse(storedSkillsStr);
      setCategories(storedSkills.map((skill: string) => ({ name: skill, questions: [] })));
    }
  }, []);

  const addOrUpdateQuestion = () => {
    if (newQuestion.trim() !== "" && selectedCategory !== null) {
      if (editIndex !== null) {
        const updatedCategories = [...categories];
        const categoryIndex = updatedCategories.findIndex((cat) => cat.name === selectedCategory);
        if (categoryIndex !== -1) {
          updatedCategories[categoryIndex].questions[editIndex] = newQuestion;
          setCategories(updatedCategories);
          setEditIndex(null);
        }
      } else {
        const updatedCategories = [...categories];
        const categoryIndex = updatedCategories.findIndex((cat) => cat.name === selectedCategory);
        if (categoryIndex !== -1) {
          updatedCategories[categoryIndex].questions.push(newQuestion);
        }
        setCategories(updatedCategories);
      }
      setNewQuestion("");
    }
  };

  const handleQuestionDelete = (categoryName: string, index: number) => {
    const updatedCategories = [...categories];
    const categoryIndex = updatedCategories.findIndex((cat) => cat.name === categoryName);
    if (categoryIndex !== -1) {
      updatedCategories[categoryIndex].questions.splice(index, 1);
      setCategories(updatedCategories);
    }
  };

  const handleEditClick = (categoryName: string, index: number) => {
    const categoryIndex = categories.findIndex((cat) => cat.name === categoryName);
    if (categoryIndex !== -1) {
      setNewQuestion(categories[categoryIndex].questions[index]);
      setEditIndex(index);
    }
  };

  const handleCategorySelection = (categoryName: string) => {
    setSelectedCategory(categoryName === "__all__" ? null : categoryName);
  };

  const handleAddCategory = () => {
    if (newCategory.trim() !== "") {
      const categoryExists = categories.some((cat) => cat.name === newCategory);
      if (!categoryExists) {
        setCategories([...categories, { name: newCategory, questions: [] }]);
        setSelectedCategory(newCategory);
      }
      setNewCategory("");
    }
  };

  const handleDeleteConfirmation = (categoryName: string) => {
    setCategoryToDelete(categoryName);
    setShowDeleteConfirmation(true);
  };

  const handleConfirmDelete = () => {
    const updatedCategories = categories.filter((cat) => cat.name !== categoryToDelete);
    setCategories(updatedCategories);
    setSelectedCategory(null);
    setShowDeleteConfirmation(false);
  };

  const handleCancelDelete = () => {
    setShowDeleteConfirmation(false);
    setCategoryToDelete("");
  };

  const handleGenerateQuestions = () => {
    const generatedData = [
      { skill: "Java", question: "What is a constructor in Java?" },
      { skill: "Python", question: "How do you define a function in Python?" },
      { skill: "JavaScript", question: "What is a closure in JavaScript?" },
    ];

    const updatedCategories = [...categories];

    generatedData.forEach((data) => {
      const categoryIndex = updatedCategories.findIndex((cat) => cat.name === data.skill);
      if (categoryIndex !== -1) {
        updatedCategories[categoryIndex].questions.push(data.question);
      } else {
        updatedCategories.push({ name: data.skill, questions: [data.question] });
      }
    });

    setCategories(updatedCategories);
  };

  const handleFinishButtonClick = async () => {
    try {
      const formData = JSON.parse(localStorage.getItem("formData") || "{}");
      const technicalSkills = formData.technicalSkills || categories.map(cat => cat.name);

      const payload = {
        jobPosition: formData.jobPosition || "",
        yearsOfExperience: formData.yearsOfExperience || "",
        jobDescription: formData.jobDescription || "",
        technicalSkills,
        questions: categories.map((cat) => ({
          skill: cat.name,
          questions: cat.questions,
        })),
      };

      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Authorization token not found.");
      }

      const headers = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      };

      const response = await axios.post("https://metashotbackend.azurewebsites.net/interview/create", payload, { headers });

      if (response.status === 200) {
        console.log("Interview created successfully:", response.data);
        window.location.href = "/Invite";
      } else {
        console.error("Failed to create interview:", response.data);
      }
    } catch (error) {
      console.error("Error creating interview:", error);
      alert("Error creating interview. Please fill out the details correctly.");
    }
  };

  // Render questions based on selectedCategory or all categories
  const renderedQuestions = selectedCategory !== null
    ? categories.find(cat => cat.name === selectedCategory)?.questions || []
    : categories.reduce((acc, cat) => [...acc, ...cat.questions], []);

  return (
    <div className="bg-green-100 min-h-screen">
      <Navbarn />
      <div className="flex">
        <Sidebarn />
        <div className="flex-1 p-4">
          <div className="mb-4">
            <div className="flex">
              <div className="w-1/2 pr-4">
                <h2 className="text-lg font-semibold mb-2 text-black">Add Specific Questions</h2>
                <textarea
                  className="border border-gray-300 rounded px-3 py-2 mb-2 w-full focus:outline-none focus:border-blue-400 text-black"
                  value={newQuestion}
                  onChange={(e) => setNewQuestion(e.target.value)}
                  placeholder="Type your question here..."
                />
                <div className="mb-2">
                  <label className="text-sm font-semibold text-black">Select or Add Skill:</label>
                  <select
                    className="border border-gray-300 rounded px-3 py-2 w-full focus:outline-none focus:border-blue-400 text-black"
                    value={selectedCategory || "__all__"}
                    onChange={(e) => handleCategorySelection(e.target.value)}
                  >
                    <option value="__all__">Show All</option>
                    {categories.map((cat, index) => (
                      <option key={index} value={cat.name}>{cat.name}</option>
                    ))}
                  </select>
                  <input
                    type="text"
                    className="border border-gray-300 rounded px-3 py-2 mt-2 w-full focus:outline-none focus:border-blue-400 text-black"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    placeholder="New Skill Name"
                  />
                </div>
              </div>
              <div className="w-1/2 pl-4">
                <div className="mb-4">
                  <h2 className="text-lg font-semibold mb-2 text-black">Added Questions</h2>
                  <ul>
                    {renderedQuestions.map((question, index) => (
                      <li key={index} className="border border-gray-300 rounded px-3 py-2 mb-2 text-black">
                        {question}
                        {selectedCategory !== null && (
                          <>
                            <button
                              className="ml-2 text-sm text-red-600"
                              onClick={() => handleQuestionDelete(selectedCategory!, index)}
                            >
                              Delete
                            </button>
                            <button
                              className="ml-2 text-sm text-blue-600"
                              onClick={() => handleEditClick(selectedCategory!, index)}
                            >
                              Edit
                            </button>
                          </>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
                {showDeleteConfirmation && (
                  <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <div className="bg-white p-4 rounded shadow-lg text-center">
                      <p className="mb-4">Are you sure you want to delete {categoryToDelete}?</p>
                      <div>
                        <button
                          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 mr-2"
                          onClick={handleConfirmDelete}
                        >
                          Yes
                        </button>
                        <button
                          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 ml-2"
                          onClick={handleCancelDelete}
                        >
                          No
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="mt-4 flex items-center">
              <button
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-500 mr-2"
                onClick={addOrUpdateQuestion}
              >
                {editIndex !== null ? "Update Question" : "Add Question"}
              </button>
              <button
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-500 mr-2"
                onClick={handleGenerateQuestions}
              >
                Generate Using AI
              </button>
              <button
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-500"
                onClick={handleAddCategory}
              >
                Add Skill
              </button>
            </div>
            <div className="mt-4">
              <button
                className="bg-green-600 text-white px-4 py-2 mt-8 rounded hover:bg-green-600 text-center"
                onClick={handleFinishButtonClick}
              >
                Finish
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AskQuestions;