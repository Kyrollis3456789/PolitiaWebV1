'use client';

import React, { useState, useMemo } from 'react';
import { clsx } from 'clsx';

// --- Types ---
export type EducationPath = 'BASIC' | 'UNIVERSITY' | 'GRADUATED' | null;
export type SchoolStage = 'PRIMARY' | 'PREPARATORY' | 'SECONDARY' | null;

export interface Step4Props {
  age: number;
  universities?: { id: string; name_en: string; name_ar?: string }[];
  faculties?: { id: string; university_id: string; name_en: string; name_ar?: string }[];
  defaultValues?: any;
  onNext: (payload: any) => void;
  onBack: () => void;
}

export default function Step4EducationWork({
  age,
  universities = [],
  faculties = [],
  defaultValues,
  onNext,
  onBack,
}: Step4Props) {
  // Bypassed path if age < 17
  const isUnder17 = age < 17;
  const initialPath = isUnder17 ? 'BASIC' : (defaultValues?.education_path || null);

  // --- Wizard State ---
  const [currentPart, setCurrentPart] = useState<number>(1);
  const [path, setPath] = useState<EducationPath>(initialPath);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // --- Path A & Prev School State ---
  const [schoolStage, setSchoolStage] = useState<SchoolStage>(defaultValues?.school_stage || null);
  const [educationSystem, setEducationSystem] = useState(defaultValues?.education_system || 'Local');
  const [grade, setGrade] = useState(defaultValues?.grade_level || '');
  const [schoolName, setSchoolName] = useState(defaultValues?.school_name || '');
  const [skipSchoolName, setSkipSchoolName] = useState(!defaultValues?.school_name && !!defaultValues?.education_path);

  // --- Path B State ---
  const [universityId, setUniversityId] = useState(defaultValues?.university_id || '');
  const [facultyId, setFacultyId] = useState(defaultValues?.faculty_id || '');
  const [academicYear, setAcademicYear] = useState(defaultValues?.academic_year || '');
  const [addPreviousSchool, setAddPreviousSchool] = useState(!!defaultValues?.school_stage && initialPath === 'UNIVERSITY');

  // --- Path C State ---
  const [isWorking, setIsWorking] = useState<boolean | null>(
    defaultValues?.is_working !== undefined && defaultValues.is_working !== null
      ? defaultValues.is_working
      : null
  );
  const [jobTitle, setJobTitle] = useState(defaultValues?.job_title || '');
  const [companyName, setCompanyName] = useState(defaultValues?.company_name || '');
  const [showUniDetails, setShowUniDetails] = useState(!!defaultValues?.university_id && initialPath === 'GRADUATED');
  const [isPostgrad, setIsPostgrad] = useState(defaultValues?.is_postgrad || false);
  const [postgradDetails, setPostgradDetails] = useState(defaultValues?.postgrad_details || '');

  // --- Dynamic Total Parts Calculation ---
  const totalParts = useMemo(() => {
    if (isUnder17) return 3; // Basic only: 1 (Stage), 2 (System & Grade), 3 (School Name)
    if (path === 'BASIC') return 4; // 1 (Status), 2 (Stage), 3 (System & Grade), 4 (School Name)
    if (path === 'UNIVERSITY') return 4; // 1 (Status), 2 (Uni & Faculty), 3 (Year), 4 (Prev School)
    if (path === 'GRADUATED') return 3; // 1 (Status), 2 (Working?), 3 (Job/Uni details)
    return 1; // Initial choice
  }, [isUnder17, path]);

  const handlePathChange = (newPath: EducationPath) => {
    setPath(newPath);
    setErrors({});

    // Clear all hidden states to prevent phantom data
    setSchoolStage(null);
    setEducationSystem('Local');
    setGrade('');
    setSchoolName('');
    setSkipSchoolName(false);

    setUniversityId('');
    setFacultyId('');
    setAcademicYear('');
    setAddPreviousSchool(false);

    setIsWorking(null);
    setJobTitle('');
    setCompanyName('');
    setShowUniDetails(false);
    setIsPostgrad(false);
    setPostgradDetails('');
  };

  const systemOptions = useMemo(() => {
    const base = ['Local', 'IG', 'American'];
    return schoolStage === 'SECONDARY' ? [...base, 'Baccalaureate'] : base;
  }, [schoolStage]);

  const gradeOptions = useMemo(() => {
    if (schoolStage === 'PRIMARY') return ['1', '2', '3', '4', '5', '6'];
    if (schoolStage === 'PREPARATORY' || schoolStage === 'SECONDARY') return ['1', '2', '3'];
    return [];
  }, [schoolStage]);

  const availableFaculties = useMemo(() => {
    return faculties.filter((f) => f.university_id === universityId);
  }, [faculties, universityId]);

  // --- Navigation & Validation Handlers ---
  const handleNext = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    const newErrors: Record<string, string> = {};

    // --- STEP 1: Current Status (Global when age >= 17) ---
    if (!isUnder17 && currentPart === 1) {
      if (!path) {
        newErrors.path = 'Please select your current status.';
      } else {
        setErrors({});
        setCurrentPart(2);
        return;
      }
    }

    // --- Path A (Basic Education) Validation ---
    if (path === 'BASIC') {
      const stagePart = isUnder17 ? 1 : 2;
      const systemPart = isUnder17 ? 2 : 3;
      const schoolPart = isUnder17 ? 3 : 4;

      if (currentPart === stagePart) {
        if (!schoolStage) {
          newErrors.schoolStage = 'Please select a school stage.';
        } else {
          setErrors({});
          setCurrentPart(currentPart + 1);
          return;
        }
      }

      if (currentPart === systemPart) {
        if (!educationSystem) newErrors.educationSystem = 'Required.';
        if (!grade) newErrors.grade = 'Please select your grade.';
        if (Object.keys(newErrors).length === 0) {
          setErrors({});
          setCurrentPart(currentPart + 1);
          return;
        }
      }

      if (currentPart === schoolPart) {
        if (!schoolName.trim() && !skipSchoolName) {
          newErrors.schoolName = 'Please enter school name or click "Skip".';
        } else {
          setErrors({});
          submitPayload();
          return;
        }
      }
    }

    // --- Path B (University) Validation ---
    if (path === 'UNIVERSITY') {
      if (currentPart === 2) {
        if (!universityId) newErrors.universityId = 'Please select a university.';
        if (!facultyId) newErrors.facultyId = 'Please select a faculty.';
        if (Object.keys(newErrors).length === 0) {
          setErrors({});
          setCurrentPart(3);
          return;
        }
      }

      if (currentPart === 3) {
        if (!academicYear) {
          newErrors.academicYear = 'Please select your current academic year.';
        } else {
          setErrors({});
          setCurrentPart(4);
          return;
        }
      }

      if (currentPart === 4) {
        if (addPreviousSchool) {
          if (!schoolStage) newErrors.schoolStage = 'Please select school stage.';
          if (!educationSystem) newErrors.educationSystem = 'Please select education system.';
          if (!schoolName.trim() && !skipSchoolName) {
            newErrors.schoolName = 'Please enter school name or click "Skip".';
          }
        }
        if (Object.keys(newErrors).length === 0) {
          setErrors({});
          submitPayload();
          return;
        }
      }
    }

    // --- Path C (Graduated) Validation ---
    if (path === 'GRADUATED') {
      if (currentPart === 2) {
        if (isWorking === null) {
          newErrors.isWorking = 'Please specify if you are working.';
        } else {
          setErrors({});
          setCurrentPart(3);
          return;
        }
      }

      if (currentPart === 3) {
        if (showUniDetails) {
          if (!universityId) newErrors.universityId = 'Please select a university.';
          if (!facultyId) newErrors.facultyId = 'Please select a faculty.';
        }
        if (Object.keys(newErrors).length === 0) {
          setErrors({});
          submitPayload();
          return;
        }
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
    }
  };

  const handleBack = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setErrors({});
    if (currentPart === 1) {
      onBack();
    } else {
      setCurrentPart((prev) => Math.max(1, prev - 1));
    }
  };

  const submitPayload = () => {
    const payload = {
      education_path: path,
      school_stage: path === 'BASIC' || (path === 'UNIVERSITY' && addPreviousSchool) ? schoolStage : null,
      education_system: path === 'BASIC' || (path === 'UNIVERSITY' && addPreviousSchool) ? educationSystem : null,
      grade_level: path === 'BASIC' ? grade : null,
      school_name: (!skipSchoolName && schoolName.trim()) ? schoolName.trim() : null,
      university_id: path === 'UNIVERSITY' || (path === 'GRADUATED' && showUniDetails) ? universityId : null,
      faculty_id: path === 'UNIVERSITY' || (path === 'GRADUATED' && showUniDetails) ? facultyId : null,
      academic_year: path === 'UNIVERSITY' ? academicYear : null,
      is_working: path === 'GRADUATED' ? isWorking : null,
      job_title: (path === 'GRADUATED' && isWorking) ? jobTitle.trim() : null,
      company_name: (path === 'GRADUATED' && isWorking) ? companyName.trim() : null,
      is_postgrad: path === 'GRADUATED' ? isPostgrad : false,
      postgrad_details: isPostgrad ? postgradDetails.trim() : null,
    };
    onNext(payload);
  };

  // --- Render Helpers ---
  const renderSchoolInputs = (isPreviousSchool = false) => (
    <div className="space-y-4">
      <div>
        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">School Stage</label>
        <div className="flex gap-2">
          {['PRIMARY', 'PREPARATORY', 'SECONDARY'].map((stage) => (
            <button
              key={stage}
              type="button"
              onClick={(e) => {
                e.preventDefault();
                setSchoolStage(stage as SchoolStage);
                setEducationSystem('Local');
                setGrade('');
                setErrors((prev) => ({ ...prev, schoolStage: '' }));
              }}
              className={clsx(
                "flex-1 p-2 rounded-xl border text-xs font-medium transition-colors",
                schoolStage === stage
                  ? "border-blue-600 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-semibold"
                  : "border-slate-300 dark:border-slate-700 bg-transparent text-slate-700 dark:text-slate-300"
              )}
            >
              {stage.charAt(0) + stage.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
        {errors.schoolStage && <p className="text-red-500 text-xs mt-1">{errors.schoolStage}</p>}
      </div>

      {schoolStage && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Education System</label>
            <select
              value={educationSystem}
              onChange={(e) => {
                setEducationSystem(e.target.value);
                setErrors((prev) => ({ ...prev, educationSystem: '' }));
              }}
              className="w-full px-3 py-2.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent text-slate-900 dark:text-slate-100"
            >
              {systemOptions.map((sys) => (
                <option key={sys} value={sys} className="bg-white dark:bg-slate-900">{sys}</option>
              ))}
            </select>
          </div>

          {!isPreviousSchool && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Grade</label>
              <select
                value={grade}
                onChange={(e) => {
                  setGrade(e.target.value);
                  setErrors((prev) => ({ ...prev, grade: '' }));
                }}
                className="w-full px-3 py-2.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent text-slate-900 dark:text-slate-100"
              >
                <option value="" className="bg-white dark:bg-slate-900">Select Grade</option>
                {gradeOptions.map((g) => (
                  <option key={g} value={g} className="bg-white dark:bg-slate-900">Grade {g}</option>
                ))}
              </select>
              {errors.grade && <p className="text-red-500 text-xs mt-1">{errors.grade}</p>}
            </div>
          )}
        </div>
      )}
    </div>
  );

  const renderUniversityInputs = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">University</label>
          <select
            value={universityId}
            onChange={(e) => {
              setUniversityId(e.target.value);
              setFacultyId('');
              setErrors((prev) => ({ ...prev, universityId: '', facultyId: '' }));
            }}
            className="w-full px-3 py-2.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent text-slate-900 dark:text-slate-100"
          >
            <option value="" className="bg-white dark:bg-slate-900">Select</option>
            {universities.map((u) => (
              <option key={u.id} value={u.id} className="bg-white dark:bg-slate-900">{u.name_en}</option>
            ))}
          </select>
          {errors.universityId && <p className="text-red-500 text-xs mt-1">{errors.universityId}</p>}
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Faculty</label>
          <select
            value={facultyId}
            onChange={(e) => {
              setFacultyId(e.target.value);
              setErrors((prev) => ({ ...prev, facultyId: '' }));
            }}
            disabled={!universityId}
            className="w-full px-3 py-2.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent text-slate-900 dark:text-slate-100 disabled:opacity-50"
          >
            <option value="" className="bg-white dark:bg-slate-900">Select</option>
            {availableFaculties.map((f) => (
              <option key={f.id} value={f.id} className="bg-white dark:bg-slate-900">{f.name_en}</option>
            ))}
          </select>
          {errors.facultyId && <p className="text-red-500 text-xs mt-1">{errors.facultyId}</p>}
        </div>
      </div>
    </div>
  );

  return (
    <div className="w-full flex-1 flex flex-col justify-between min-h-[420px] space-y-4">
      {/* Sub-step Card Container with React Key Reconciliation */}
      <div
        key={`${path || 'ROOT'}-${currentPart}`}
        className="w-full flex-1 flex flex-col py-2 animate-fadeIn"
      >
        {/* --- PART 1: Current Status Selection (when age >= 17) --- */}
        {!isUnder17 && currentPart === 1 && (
          <div className="mb-6">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-3">
              What is your current status?
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { label: 'Basic Education', value: 'BASIC' },
                { label: 'University', value: 'UNIVERSITY' },
                { label: 'Graduated', value: 'GRADUATED' },
              ].map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    handlePathChange(opt.value as EducationPath);
                  }}
                  className={clsx(
                    "p-4 rounded-xl border text-xs font-semibold transition-all duration-200 text-center cursor-pointer",
                    path === opt.value
                      ? "border-blue-600 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 shadow-sm"
                      : "border-slate-200 dark:border-slate-700 bg-transparent text-slate-600 dark:text-slate-400 hover:border-slate-300"
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
            {errors.path && <p className="text-red-500 text-xs mt-2">{errors.path}</p>}
          </div>
        )}

        {/* --- PATH A: BASIC EDUCATION --- */}
        {path === 'BASIC' && (
          <>
            {/* Part A.1 (or 2): School Stage */}
            {currentPart === (isUnder17 ? 1 : 2) && (
              <div className="space-y-2">
                {renderSchoolInputs(false)}
              </div>
            )}

            {/* Part A.2 (or 3): Education System & Grade */}
            {currentPart === (isUnder17 ? 2 : 3) && schoolStage && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Education System</label>
                    <select
                      value={educationSystem}
                      onChange={(e) => setEducationSystem(e.target.value)}
                      className="w-full px-3 py-2.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent text-slate-900 dark:text-slate-100"
                    >
                      {systemOptions.map((sys) => (
                        <option key={sys} value={sys} className="bg-white dark:bg-slate-900">{sys}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Grade</label>
                    <select
                      value={grade}
                      onChange={(e) => {
                        setGrade(e.target.value);
                        setErrors((prev) => ({ ...prev, grade: '' }));
                      }}
                      className="w-full px-3 py-2.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent text-slate-900 dark:text-slate-100"
                    >
                      <option value="" className="bg-white dark:bg-slate-900">Select Grade</option>
                      {gradeOptions.map((g) => (
                        <option key={g} value={g} className="bg-white dark:bg-slate-900">Grade {g}</option>
                      ))}
                    </select>
                    {errors.grade && <p className="text-red-500 text-xs mt-1">{errors.grade}</p>}
                  </div>
                </div>
              </div>
            )}

            {/* Part A.3 (or 4): School Name */}
            {currentPart === (isUnder17 ? 3 : 4) && (
              <div className="space-y-3">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Current School Name</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="e.g. St. George College"
                    value={schoolName}
                    onChange={(e) => {
                      setSchoolName(e.target.value);
                      if (e.target.value) setSkipSchoolName(false);
                      setErrors((prev) => ({ ...prev, schoolName: '' }));
                    }}
                    disabled={skipSchoolName}
                    className={clsx(
                      "flex-1 px-3 py-2.5 text-xs rounded-xl border transition-colors",
                      skipSchoolName
                        ? "bg-slate-100 dark:bg-slate-800 text-slate-400 border-slate-200 dark:border-slate-700"
                        : "bg-transparent text-slate-900 dark:text-slate-100 border-slate-300 dark:border-slate-700",
                      errors.schoolName && "border-red-500"
                    )}
                  />
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setSkipSchoolName((prev) => {
                        const nextVal = !prev;
                        if (nextVal) setSchoolName('');
                        return nextVal;
                      });
                      setErrors((prev) => ({ ...prev, schoolName: '' }));
                    }}
                    className={clsx(
                      "px-4 py-2 rounded-xl border text-xs font-medium transition-colors whitespace-nowrap cursor-pointer",
                      skipSchoolName
                        ? "bg-slate-800 text-white border-slate-800"
                        : "bg-transparent text-slate-600 dark:text-slate-300 border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800"
                    )}
                  >
                    {skipSchoolName ? 'Skipped' : 'Skip'}
                  </button>
                </div>
                {errors.schoolName && <p className="text-red-500 text-xs mt-1">{errors.schoolName}</p>}
              </div>
            )}
          </>
        )}

        {/* --- PATH B: UNIVERSITY --- */}
        {path === 'UNIVERSITY' && (
          <>
            {/* Part B.2: University & Faculty */}
            {currentPart === 2 && (
              <div className="space-y-4">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Select your University and Faculty
                </label>
                {renderUniversityInputs()}
              </div>
            )}

            {/* Part B.3: Current Academic Year */}
            {currentPart === 3 && (
              <div className="space-y-4">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Current Academic Year
                </label>
                <select
                  value={academicYear}
                  onChange={(e) => {
                    setAcademicYear(e.target.value);
                    setErrors((prev) => ({ ...prev, academicYear: '' }));
                  }}
                  className="w-full px-3 py-2.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent text-slate-900 dark:text-slate-100"
                >
                  <option value="" className="bg-white dark:bg-slate-900">Select Year</option>
                  {['1', '2', '3', '4', '5', '6', '7'].map((y) => (
                    <option key={y} value={y} className="bg-white dark:bg-slate-900">Year {y}</option>
                  ))}
                </select>
                {errors.academicYear && <p className="text-red-500 text-xs mt-1">{errors.academicYear}</p>}
              </div>
            )}

            {/* Part B.4: Previous School (Optional Add) */}
            {currentPart === 4 && (
              <div className="space-y-4">
                <label className="block text-sm font-semibold text-slate-900 dark:text-slate-100">
                  Would you like to add your previous school details?
                </label>
                <div className="flex gap-3 mb-2">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      setAddPreviousSchool(true);
                    }}
                    className={clsx(
                      "px-4 py-2 text-xs rounded-xl font-medium border transition-colors cursor-pointer",
                      addPreviousSchool
                        ? "bg-blue-600 text-white border-blue-600 font-semibold"
                        : "bg-transparent text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700"
                    )}
                  >
                    Yes
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      setAddPreviousSchool(false);
                      setSchoolStage(null);
                      setSchoolName('');
                      setErrors({});
                    }}
                    className={clsx(
                      "px-4 py-2 text-xs rounded-xl font-medium border transition-colors cursor-pointer",
                      !addPreviousSchool
                        ? "bg-slate-800 text-white border-slate-800 font-semibold"
                        : "bg-transparent text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700"
                    )}
                  >
                    No
                  </button>
                </div>
                {addPreviousSchool && (
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                    {renderSchoolInputs(true)}
                    {schoolStage && (
                      <div className="pt-3">
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Previous School Name</label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            placeholder="e.g. St. George College"
                            value={schoolName}
                            onChange={(e) => {
                              setSchoolName(e.target.value);
                              if (e.target.value) setSkipSchoolName(false);
                              setErrors((prev) => ({ ...prev, schoolName: '' }));
                            }}
                            disabled={skipSchoolName}
                            className={clsx(
                              "flex-1 px-3 py-2.5 text-xs rounded-xl border transition-colors",
                              skipSchoolName
                                ? "bg-slate-100 dark:bg-slate-800 text-slate-400 border-slate-200 dark:border-slate-700"
                                : "bg-transparent text-slate-900 dark:text-slate-100 border-slate-300 dark:border-slate-700",
                              errors.schoolName && "border-red-500"
                            )}
                          />
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              setSkipSchoolName((prev) => {
                                const nextVal = !prev;
                                if (nextVal) setSchoolName('');
                                return nextVal;
                              });
                              setErrors((prev) => ({ ...prev, schoolName: '' }));
                            }}
                            className={clsx(
                              "px-4 py-2 rounded-xl border text-xs font-medium transition-colors whitespace-nowrap cursor-pointer",
                              skipSchoolName
                                ? "bg-slate-800 text-white border-slate-800"
                                : "bg-transparent text-slate-600 dark:text-slate-300 border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800"
                            )}
                          >
                            {skipSchoolName ? 'Skipped' : 'Skip'}
                          </button>
                        </div>
                        {errors.schoolName && <p className="text-red-500 text-xs mt-1">{errors.schoolName}</p>}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </>
        )}

        {/* --- PATH C: GRADUATED --- */}
        {path === 'GRADUATED' && (
          <>
            {/* Part C.2: Working Status */}
            {currentPart === 2 && (
              <div className="space-y-4">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Are you currently working?
                </label>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      setIsWorking(true);
                      setErrors((prev) => ({ ...prev, isWorking: '' }));
                    }}
                    className={clsx(
                      "flex-1 py-3 text-xs rounded-xl border font-semibold transition-colors cursor-pointer",
                      isWorking === true
                        ? "bg-blue-600 text-white border-blue-600"
                        : "bg-transparent text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700"
                    )}
                  >
                    Yes
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      setIsWorking(false);
                      setJobTitle('');
                      setCompanyName('');
                      setErrors((prev) => ({ ...prev, isWorking: '' }));
                    }}
                    className={clsx(
                      "flex-1 py-3 text-xs rounded-xl border font-semibold transition-colors cursor-pointer",
                      isWorking === false
                        ? "bg-blue-600 text-white border-blue-600"
                        : "bg-transparent text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700"
                    )}
                  >
                    No
                  </button>
                </div>
                {errors.isWorking && <p className="text-red-500 text-xs mt-1">{errors.isWorking}</p>}
              </div>
            )}

            {/* Part C.3: Career / Uni / Postgrad Details */}
            {currentPart === 3 && (
              <div className="space-y-4">
                {isWorking === false && (
                  <div className="space-y-3">
                    <h4 className="text-xs font-semibold text-slate-500 dark:text-slate-400">University Details (Optional)</h4>
                    {renderUniversityInputs()}
                  </div>
                )}

                {isWorking === true && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Job Title</label>
                        <input
                          type="text"
                          value={jobTitle}
                          onChange={(e) => setJobTitle(e.target.value)}
                          className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent text-slate-900 dark:text-slate-100"
                          placeholder="Optional"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Company</label>
                        <input
                          type="text"
                          value={companyName}
                          onChange={(e) => setCompanyName(e.target.value)}
                          className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent text-slate-900 dark:text-slate-100"
                          placeholder="Optional"
                        />
                      </div>
                    </div>

                    {!showUniDetails ? (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          setShowUniDetails(true);
                        }}
                        className="text-blue-600 text-xs font-semibold hover:underline cursor-pointer"
                      >
                        + Add University Details
                      </button>
                    ) : (
                      <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 relative">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            setShowUniDetails(false);
                            setUniversityId('');
                            setFacultyId('');
                          }}
                          className="absolute top-2 right-2 text-slate-400 hover:text-slate-600 cursor-pointer"
                        >
                          ✕
                        </button>
                        {renderUniversityInputs()}
                      </div>
                    )}
                  </div>
                )}

                <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80">
                  {!isPostgrad ? (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        setIsPostgrad(true);
                      }}
                      className="text-slate-500 hover:text-blue-600 text-xs font-semibold underline underline-offset-4 cursor-pointer"
                    >
                      Are you pursuing Post-Graduate studies?
                    </button>
                  ) : (
                    <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-800 relative">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          setIsPostgrad(false);
                          setPostgradDetails('');
                        }}
                        className="absolute top-2 right-2 text-blue-400 cursor-pointer"
                      >
                        ✕
                      </button>
                      <label className="block text-xs font-semibold text-blue-900 dark:text-blue-300 mb-1">Post-Graduate Details</label>
                      <textarea
                        value={postgradDetails}
                        onChange={(e) => setPostgradDetails(e.target.value)}
                        className="w-full px-3 py-2 text-xs rounded-xl border border-blue-200 dark:border-blue-850 bg-transparent text-blue-900 dark:text-blue-100"
                        rows={2}
                      />
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-between gap-3 pt-4 border-t border-slate-100 dark:border-slate-800/80">
        <button
          type="button"
          onClick={handleBack}
          className="text-xs sm:text-sm font-semibold text-[#0B57D0] dark:text-[#93C5FD] hover:underline px-3 py-2 rounded-full cursor-pointer"
        >
          Back
        </button>
        <button
          type="button"
          onClick={handleNext}
          className="text-xs sm:text-sm font-semibold px-6 py-2.5 rounded-full transition-all flex items-center justify-center gap-2 shadow-sm bg-[#0B57D0] hover:bg-[#0842A0] text-white cursor-pointer"
        >
          {currentPart === totalParts ? 'Finish' : 'Next'}
        </button>
      </div>
    </div>
  );
}
