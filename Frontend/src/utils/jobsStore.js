const JOBS_STORAGE_KEY = "virtuehire_jobs";
const JOBS_EVENT_NAME = "virtuehire_jobs_updated";
const CONTACT_ACCESS_REQUESTS_KEY = "virtuehire_contact_access_requests";
const CONTACT_ACCESS_EVENT_NAME = "virtuehire_contact_access_updated";
export const JOB_STATUS = {
  OPEN: "open",
  PAUSED: "paused",
  CLOSED: "closed",
};

const safeParse = (value) => {
  try {
    return JSON.parse(value);
  } catch (error) {
    return [];
  }
};

const normalizeJob = (job) => ({
  ...job,
  status: Object.values(JOB_STATUS).includes(job?.status)
    ? job.status
    : JOB_STATUS.OPEN,
});

const normalizeJobs = (jobs) =>
  [...jobs]
    .filter((job) => job && job.id)
    .map(normalizeJob)
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );

export const getJobs = () => {
  const jobs = safeParse(localStorage.getItem(JOBS_STORAGE_KEY) || "[]");
  return normalizeJobs(Array.isArray(jobs) ? jobs : []);
};

const persistJobs = (jobs) => {
  localStorage.setItem(JOBS_STORAGE_KEY, JSON.stringify(jobs));
  window.dispatchEvent(new Event(JOBS_EVENT_NAME));
};

const getContactAccessRequestsRaw = () => {
  const requests = safeParse(
    localStorage.getItem(CONTACT_ACCESS_REQUESTS_KEY) || "[]",
  );
  return Array.isArray(requests) ? requests : [];
};

const persistContactAccessRequests = (requests) => {
  localStorage.setItem(CONTACT_ACCESS_REQUESTS_KEY, JSON.stringify(requests));
  window.dispatchEvent(new Event(CONTACT_ACCESS_EVENT_NAME));
};

export const createJob = (payload) => {
  const now = new Date().toISOString();
  const job = {
    id: `job_${Date.now()}_${Math.floor(Math.random() * 100000)}`,
    title: payload.title || "",
    company: payload.company || "",
    location: payload.location || "",
    type: payload.type || "Full-time",
    salary: payload.salary || "",
    experience: payload.experience || "",
    skills: payload.skills || "",
    description: payload.description || "",
    postedBy: payload.postedBy || "HR Team",
    createdAt: now,
    status: payload.status || JOB_STATUS.OPEN,
    candidateResponses: [],
  };

  const jobs = getJobs();
  persistJobs([job, ...jobs]);
  return job;
};

export const updateJob = (jobId, payload) => {
  const jobs = getJobs();
  const updatedJobs = jobs.map((job) =>
    job.id === jobId
      ? {
          ...job,
          ...payload,
          id: job.id,
          createdAt: job.createdAt,
        }
      : job,
  );

  persistJobs(updatedJobs);
  return updatedJobs.find((job) => job.id === jobId) || null;
};

export const deleteJob = (jobId) => {
  const jobs = getJobs();
  const updatedJobs = jobs.filter((job) => job.id !== jobId);
  persistJobs(updatedJobs);
};

export const updateJobStatus = (jobId, status) => {
  if (!Object.values(JOB_STATUS).includes(status)) return null;
  return updateJob(jobId, { status });
};

const resolveCandidateKey = (candidate = {}) =>
  candidate.id || candidate.candidateId || candidate.email || "";

const resolveHrKey = (hr = {}) => hr.id || hr.hrId || hr.email || "";

export const setCandidateJobInterest = (jobId, candidate, status) => {
  const candidateKey = resolveCandidateKey(candidate);
  if (!candidateKey) return { updated: false, reason: "missing_candidate" };

  const jobs = getJobs();
  let result = { updated: false, status: "" };
  const updatedJobs = jobs.map((job) => {
    if (job.id !== jobId) return job;

    const responses = Array.isArray(job.candidateResponses)
      ? [...job.candidateResponses]
      : [];
    const index = responses.findIndex(
      (item) => item.candidateId === candidateKey,
    );
    if (index >= 0) {
      result = {
        updated: false,
        reason: "already_responded",
        status: responses[index]?.status || "",
      };
      return job;
    }

    const response = {
      candidateId: candidateKey,
      fullName: candidate.fullName || "Candidate",
      email: candidate.email || "N/A",
      phoneNumber: candidate.phoneNumber || "N/A",
      skills: candidate.skills || "",
      experience: candidate.experience ?? 0,
      status,
      updatedAt: new Date().toISOString(),
    };

    responses.push(response);
    result = { updated: true, status };

    return {
      ...job,
      candidateResponses: responses,
    };
  });

  persistJobs(updatedJobs);
  return result;
};

export const getCandidateJobStatus = (job, candidate) => {
  const candidateKey = resolveCandidateKey(candidate);
  if (!candidateKey) return "";

  const responses = Array.isArray(job?.candidateResponses)
    ? job.candidateResponses
    : [];
  const response = responses.find((item) => item.candidateId === candidateKey);
  return response?.status || "";
};

export const getInterestedCandidates = (job) => {
  const responses = Array.isArray(job?.candidateResponses)
    ? job.candidateResponses
    : [];
  return responses
    .filter((item) => item.status === "interested")
    .sort(
      (a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
    );
};

export const getAllInterestedCandidates = () => {
  const jobs = getJobs();
  const result = [];

  jobs.forEach((job) => {
    const interestedCandidates = getInterestedCandidates(job);
    interestedCandidates.forEach((candidate) => {
      result.push({
        jobId: job.id,
        jobTitle: job.title,
        company: job.company,
        location: job.location,
        candidateId: candidate.candidateId,
        fullName: candidate.fullName,
        email: candidate.email,
        phoneNumber: candidate.phoneNumber,
        skills: candidate.skills,
        experience: candidate.experience,
        markedAt: candidate.updatedAt,
      });
    });
  });

  return result.sort(
    (a, b) => new Date(b.markedAt).getTime() - new Date(a.markedAt).getTime(),
  );
};

export const createContactAccessRequest = ({ hr, candidate, job }) => {
  const hrKey = resolveHrKey(hr);
  const candidateId = candidate?.candidateId || candidate?.id || "";
  if (!hrKey || !candidateId) return null;

  const requests = getContactAccessRequestsRaw();
  const existingIndex = requests.findIndex(
    (request) => request.hrKey === hrKey && request.candidateId === candidateId,
  );

  const nextRequest = {
    id:
      existingIndex >= 0
        ? requests[existingIndex].id
        : `car_${Date.now()}_${Math.floor(Math.random() * 100000)}`,
    hrKey,
    hrName: hr.fullName || "HR Team",
    hrEmail: hr.email || "N/A",
    candidateId,
    candidateName: candidate.fullName || "Candidate",
    candidateEmail: candidate.email || "N/A",
    candidatePhone: candidate.phoneNumber || "N/A",
    candidateSkills: candidate.skills || "",
    candidateExperience: candidate.experience ?? 0,
    jobId: job?.jobId || job?.id || "",
    jobTitle: job?.jobTitle || job?.title || "",
    status: "PENDING",
    createdAt:
      existingIndex >= 0
        ? requests[existingIndex].createdAt
        : new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  if (existingIndex >= 0) {
    requests[existingIndex] = nextRequest;
  } else {
    requests.unshift(nextRequest);
  }

  persistContactAccessRequests(requests);
  return nextRequest;
};

export const getContactAccessRequests = () =>
  [...getContactAccessRequestsRaw()].sort(
    (a, b) =>
      new Date(b.updatedAt || b.createdAt).getTime() -
      new Date(a.updatedAt || a.createdAt).getTime(),
  );

export const reviewContactAccessRequest = (requestId, status) => {
  if (!["APPROVED", "REJECTED"].includes(status)) return;
  const requests = getContactAccessRequestsRaw();
  const updatedRequests = requests.map((request) =>
    request.id === requestId
      ? {
          ...request,
          status,
          updatedAt: new Date().toISOString(),
        }
      : request,
  );

  persistContactAccessRequests(updatedRequests);
};

export const getHrCandidateAccessStatus = (hr, candidateId) => {
  const hrKey = resolveHrKey(hr);
  if (!hrKey || !candidateId) return "NONE";
  const requests = getContactAccessRequestsRaw()
    .filter(
      (request) =>
        request.hrKey === hrKey && request.candidateId === candidateId,
    )
    .sort(
      (a, b) =>
        new Date(b.updatedAt || b.createdAt).getTime() -
        new Date(a.updatedAt || a.createdAt).getTime(),
    );
  return requests[0]?.status || "NONE";
};

export const subscribeJobs = (callback) => {
  const onLocalEvent = () => callback(getJobs());
  const onStorage = (event) => {
    if (event.key === JOBS_STORAGE_KEY) {
      callback(getJobs());
    }
  };

  window.addEventListener(JOBS_EVENT_NAME, onLocalEvent);
  window.addEventListener("storage", onStorage);

  return () => {
    window.removeEventListener(JOBS_EVENT_NAME, onLocalEvent);
    window.removeEventListener("storage", onStorage);
  };
};

export const subscribeContactAccessRequests = (callback) => {
  const onLocalEvent = () => callback(getContactAccessRequests());
  const onStorage = (event) => {
    if (event.key === CONTACT_ACCESS_REQUESTS_KEY) {
      callback(getContactAccessRequests());
    }
  };

  window.addEventListener(CONTACT_ACCESS_EVENT_NAME, onLocalEvent);
  window.addEventListener("storage", onStorage);

  return () => {
    window.removeEventListener(CONTACT_ACCESS_EVENT_NAME, onLocalEvent);
    window.removeEventListener("storage", onStorage);
  };
};
