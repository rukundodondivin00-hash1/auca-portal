import { useState, useEffect } from 'react';
import { Info, CheckSquare, Square, Loader2, CheckCircle2 } from 'lucide-react';

// Replace with your actual backend URL
const API_BASE_URL = "http://localhost:8080/api/v1/registration";

interface Course {
  id: number;
  courseCode: string;
  courseName: string;
  credits: number;
  fee: number;
  lecturerName?: string;
}

export default function MyRegistration() {
  const [activeTerm, setActiveTerm] = useState("Loading...");
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourseIds, setSelectedCourseIds] = useState<number[]>([]);
  const [isRegistrationOpen, setIsRegistrationOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const studentId = localStorage.getItem('student_id') || '25306';

  useEffect(() => {
    const fetchRegistrationData = async () => {
      setLoading(true);
      try {
        // Fetch courses from your Spring Boot controller
        const response = await fetch(`${API_BASE_URL}/available-courses`);
        
        if (response.ok) {
          const data = await response.json();
          setCourses(data);
          setActiveTerm("Active Term"); // You can add an endpoint to fetch the term name specifically
          setIsRegistrationOpen(true);
        } else {
          setIsRegistrationOpen(false);
          setActiveTerm("Closed");
        }
      } catch (error) {
        setIsRegistrationOpen(false);
      } finally {
        setLoading(false);
      }
    };
    fetchRegistrationData();
  }, []);

  const handleSubmitRegistration = async () => {
    if (selectedCourseIds.length === 0) return;

    setSubmitting(true);
    try {
      const response = await fetch(`${API_BASE_URL}/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Student-Id': studentId
        },
        body: JSON.stringify(selectedCourseIds)
      });

      if (response.ok) {
        setSuccessMessage("Registration submitted successfully!");
        setSelectedCourseIds([]);
      } else {
        throw new Error("Submission failed");
      }
    } catch (error) {
      alert("Failed to submit registration.");
    } finally {
      setSubmitting(false);
    }
  };

  // ... rest of your UI logic remains the same ...
  // (Included for structure)
  return (
    <div className="space-y-6">
        {/* Your existing JSX structure here */}
    </div>
  );
}