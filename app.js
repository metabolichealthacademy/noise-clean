const analyzeButton = document.getElementById("analyzeButton");
const claimInput = document.getElementById("claim");

const results = document.getElementById("results");
const resultLabel = document.getElementById("resultLabel");
const scoreElement = document.getElementById("score");
const reasonsElement = document.getElementById("reasons");
const flagsElement = document.getElementById("claimFlags");
const sourcesElement = document.getElementById("sources");


analyzeButton.addEventListener("click", analyzeClaim);


async function analyzeClaim() {

  const claim = claimInput.value.trim();

  if (!claim) {
    alert("Please enter a health claim first.");
    return;
  }

  let score = 5;
  const reasons = [];
  const flags = [];

  const lowerClaim = claim.toLowerCase();


  // Detect absolute language

  const absoluteWords = [
    "cure",
    "cures",
    "cured",
    "guaranteed",
    "always",
    "never",
    "completely",
    "100%",
    "reverses",
    "reverse"
  ];

  const hasAbsoluteLanguage =
    absoluteWords.some(word => lowerClaim.includes(word));

  if (hasAbsoluteLanguage) {

    score -= 2;

    reasons.push(
      "The claim contains absolute or unusually strong language."
    );

    flags.push("Absolute claim");

  }


  // Detect treatment/prevention language

  const treatmentWords = [
    "treat",
    "treatment",
    "prevent",
    "prevents",
    "heal",
    "heals",
    "medicine",
    "medication"
  ];

  const discussesTreatment =
    treatmentWords.some(word => lowerClaim.includes(word));

  if (discussesTreatment) {

    reasons.push(
      "The claim concerns treatment or prevention and therefore requires appropriate medical evidence."
    );

    flags.push("Treatment/prevention claim");

  }


  // Detect disease-related language

  const healthTerms = [
    "diabetes",
    "prediabetes",
    "insulin resistance",
    "obesity",
    "blood pressure",
    "cholesterol",
    "heart disease",
    "stroke",
    "cancer",
    "fatty liver",
    "sleep apnea",
    "pcos"
  ];

  const mentionsHealthCondition =
    healthTerms.some(term => lowerClaim.includes(term));

  if (mentionsHealthCondition) {

    reasons.push(
      "The statement concerns a recognized health condition."
    );

    flags.push("Health-related claim");

  }


  // Detect promotional/extraordinary language

  const promotionalWords = [
    "miracle",
    "secret",
    "hack",
    "magic",
    "detox",
    "instant",
    "shocking"
  ];

  const hasPromotionalLanguage =
    promotionalWords.some(word => lowerClaim.includes(word));

  if (hasPromotionalLanguage) {

    score -= 1;

    reasons.push(
      "The wording contains promotional or sensational language."
    );

    flags.push("Promotional language");

  }


  // Keep score inside 0-10

  score = Math.max(0, Math.min(10, score));


  let label;


  if (score >= 8) {

    label = "WELL SUPPORTED";

  } else if (score >= 6) {

    label = "PARTIALLY SUPPORTED";

  } else if (score >= 4) {

    label = "INSUFFICIENT EVIDENCE";

  } else if (score >= 2) {

    label = "MISLEADING";

  } else {

    label = "UNSUPPORTED";

  }


  if (reasons.length === 0) {

    reasons.push(
      "The prototype did not detect major warning characteristics in the wording."
    );

  }


  displayResult(
    claim,
    score,
    label,
    reasons,
    flags
  );

}


function displayResult(
  claim,
  score,
  label,
  reasons,
  flags
) {

  results.classList.remove("hidden");

  resultLabel.textContent = label;

  scoreElement.textContent = score;


  reasonsElement.innerHTML = "";

  reasons.forEach(reason => {

    const li = document.createElement("li");

    li.textContent = reason;

    reasonsElement.appendChild(li);

  });


  flagsElement.innerHTML = "";

  if (flags.length === 0) {

    const flag = document.createElement("span");

    flag.className = "flag";

    flag.textContent = "No major wording flags detected";

    flagsElement.appendChild(flag);

  } else {

    flags.forEach(flagText => {

      const flag = document.createElement("span");

      flag.className = "flag";

      flag.textContent = flagText;

      flagsElement.appendChild(flag);

    });

  }


  loadSources();

  results.scrollIntoView({
    behavior: "smooth"
  });

}


async function loadSources() {

  try {

    const response = await fetch("sources.json");

    const sources = await response.json();

    sourcesElement.innerHTML = "";

    sources.forEach(source => {

      const div = document.createElement("div");

      div.className = "source";

      div.innerHTML = `
        <strong>${source.name}</strong>
        <small>
          ${source.type} · Tier ${source.tier}
        </small>
        <br>
        <a href="${source.url}" target="_blank" rel="noopener noreferrer">
          Visit source
        </a>
      `;

      sourcesElement.appendChild(div);

    });

  } catch (error) {

    sourcesElement.innerHTML =
      "<p>Source library could not be loaded.</p>";

    console.error(error);

  }

}
