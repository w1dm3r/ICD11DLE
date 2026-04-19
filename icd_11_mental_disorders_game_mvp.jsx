import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Search, Share2, RotateCcw, Brain, Globe, Flame, CheckCircle2, XCircle, Lightbulb } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

const MAX_GUESSES = 5;
const STORAGE_PREFIX = "icd11dle";

const diagnoses = [
  {
    id: "6A70",
    category: "anxiety",
    difficulty: 1,
    lang: {
      en: {
        title: "Generalized anxiety disorder",
        plainExplanation:
          "Persistent and difficult-to-control anxiety and worry across multiple areas of life, often with tension or other bodily symptoms.",
        hints: [
          "This diagnosis sits in the anxiety or fear-related disorders grouping.",
          "The core problem is broad, persistent worry across different areas of life rather than a single trigger.",
          "It is not defined by sudden brief attacks of terror.",
          "Physical tension, restlessness, and feeling on edge commonly fit this picture.",
          "The official title starts with a word that means broad or widespread."
        ],
        distractors: ["Panic disorder", "Social anxiety disorder"],
        aliases: ["gad", "generalized anxiety", "generalised anxiety disorder"]
      },
      de: {
        title: "Generalisierte Angststörung",
        plainExplanation:
          "Anhaltende und schwer kontrollierbare Angst und Sorgen in mehreren Lebensbereichen, oft mit Anspannung oder weiteren körperlichen Symptomen.",
        hints: [
          "Diese Diagnose gehört zu den Angst- oder furchtbezogenen Störungen.",
          "Das Kernproblem sind breit verteilte und anhaltende Sorgen in mehreren Lebensbereichen.",
          "Sie wird nicht durch plötzliche kurze Panikattacken definiert.",
          "Anspannung, innere Unruhe und das Gefühl, ständig angespannt zu sein, passen häufig dazu.",
          "Der offizielle Titel beginnt mit einem Wort, das breit oder umfassend bedeutet."
        ],
        distractors: ["Panikstörung", "Soziale Angststörung"],
        aliases: ["gas", "generalisierte angst"]
      }
    }
  },
  {
    id: "6B01",
    category: "mood",
    difficulty: 1,
    lang: {
      en: {
        title: "Recurrent depressive disorder",
        plainExplanation:
          "Repeated depressive episodes marked by low mood or loss of interest, with intervals in which a full episode is not present.",
        hints: [
          "This diagnosis belongs to mood disorders.",
          "It is about episodes rather than a lifelong personality pattern.",
          "The key features include low mood or marked loss of interest.",
          "The official wording distinguishes it from a single episode presentation.",
          "The title includes a word meaning that it comes back again."
        ],
        distractors: ["Single episode depressive disorder", "Cyclothymic disorder"],
        aliases: ["recurrent depression", "depression recurrent"]
      },
      de: {
        title: "Rezidivierende depressive Störung",
        plainExplanation:
          "Wiederkehrende depressive Episoden mit gedrückter Stimmung oder Interessenverlust, unterbrochen von Phasen ohne vollständige Episode.",
        hints: [
          "Diese Diagnose gehört zu den affektiven Störungen.",
          "Es geht um Episoden und nicht um ein lebenslang stabiles Persönlichkeitsmuster.",
          "Wichtige Merkmale sind gedrückte Stimmung oder deutlicher Interessenverlust.",
          "Die offizielle Formulierung grenzt sie von einer einzelnen Episode ab.",
          "Im Titel steckt ein Wort dafür, dass etwas wiederkehrt."
        ],
        distractors: ["Einzelne Episode einer depressiven Störung", "Zyklothyme Störung"],
        aliases: ["depression rezidivierend", "rezidivierende depression"]
      }
    }
  },
  {
    id: "6B41",
    category: "stress",
    difficulty: 2,
    lang: {
      en: {
        title: "Post traumatic stress disorder",
        plainExplanation:
          "A trauma-related condition involving re-experiencing the event in the present, avoidance, and a persistent sense of threat after an extremely threatening or horrific event.",
        hints: [
          "This diagnosis sits among disorders specifically associated with stress.",
          "Exposure to an extremely threatening or horrific event is central.",
          "Re-experiencing is not just remembering; it often feels as if the event is happening again in the present.",
          "Avoidance and a persistent sense of current threat are important clues.",
          "The title is often abbreviated with four letters."
        ],
        distractors: ["Adjustment disorder", "Complex post traumatic stress disorder"],
        aliases: ["ptsd", "post-traumatic stress disorder", "post traumatic stress"]
      },
      de: {
        title: "Posttraumatische Belastungsstörung",
        plainExplanation:
          "Eine traumaassoziierte Störung mit Wiedererleben in der Gegenwart, Vermeidung und einem anhaltenden Gefühl von Bedrohung nach einem extrem bedrohlichen oder entsetzlichen Ereignis.",
        hints: [
          "Diese Diagnose gehört zu den spezifisch mit Stress verbundenen Störungen.",
          "Zentral ist die Konfrontation mit einem extrem bedrohlichen oder entsetzlichen Ereignis.",
          "Wiedererleben bedeutet hier mehr als blosses Erinnern; es fühlt sich oft an, als geschehe es wieder in der Gegenwart.",
          "Vermeidung und ein anhaltendes Gefühl aktueller Bedrohung sind wichtige Hinweise.",
          "Der englische Titel wird oft mit vier Buchstaben abgekürzt."
        ],
        distractors: ["Anpassungsstörung", "Komplexe posttraumatische Belastungsstörung"],
        aliases: ["ptbs", "ptsd", "posttraumatische belastung"]
      }
    }
  },
  {
    id: "6B40",
    category: "stress",
    difficulty: 2,
    lang: {
      en: {
        title: "Adjustment disorder",
        plainExplanation:
          "A maladaptive response to an identifiable stressor, with preoccupation and failure to adapt that causes significant impairment.",
        hints: [
          "This diagnosis belongs to disorders specifically associated with stress.",
          "It is linked to an identifiable stressor, but not necessarily an extreme trauma.",
          "Preoccupation with the stressor and difficulty adapting are central.",
          "It is often confused with more severe trauma-related presentations.",
          "The first word in the title refers to adapting to change."
        ],
        distractors: ["Post traumatic stress disorder", "Generalized anxiety disorder"],
        aliases: ["adjustment", "adjustment d/o"]
      },
      de: {
        title: "Anpassungsstörung",
        plainExplanation:
          "Eine fehlangepasste Reaktion auf einen identifizierbaren Belastungsfaktor mit starker gedanklicher Beschäftigung und Anpassungsschwierigkeiten, die deutlich beeinträchtigen.",
        hints: [
          "Diese Diagnose gehört zu den spezifisch mit Stress verbundenen Störungen.",
          "Sie hängt mit einem identifizierbaren Belastungsfaktor zusammen, aber nicht zwingend mit einem extremen Trauma.",
          "Zentral sind gedankliche Beschäftigung mit dem Belastungsfaktor und Schwierigkeiten, sich anzupassen.",
          "Sie wird oft mit schwereren traumaassoziierten Störungen verwechselt.",
          "Das erste Wort im Titel bezieht sich auf Anpassung an Veränderung."
        ],
        distractors: ["Posttraumatische Belastungsstörung", "Generalisierte Angststörung"],
        aliases: ["anpassung", "adjustment disorder"]
      }
    }
  },
  {
    id: "6B20",
    category: "ocd",
    difficulty: 2,
    lang: {
      en: {
        title: "Obsessive-compulsive disorder",
        plainExplanation:
          "A condition involving persistent obsessions, compulsions, or both, experienced as difficult to control and time-consuming or distressing.",
        hints: [
          "This diagnosis sits in obsessive-compulsive or related disorders.",
          "The problem may involve intrusive thoughts, repetitive acts, or both.",
          "The behaviours are usually not performed for pleasure but to reduce distress or prevent feared outcomes.",
          "It is more specific than general perfectionism or everyday checking habits.",
          "The title contains two linked adjectives joined by a hyphen."
        ],
        distractors: ["Body dysmorphic disorder", "Generalized anxiety disorder"],
        aliases: ["ocd", "obsessive compulsive"]
      },
      de: {
        title: "Zwangsstörung",
        plainExplanation:
          "Eine Störung mit anhaltenden Zwangsgedanken, Zwangshandlungen oder beidem, die schwer kontrollierbar sind und Zeit beanspruchen oder belasten.",
        hints: [
          "Diese Diagnose gehört zu den Zwangs- und verwandten Störungen.",
          "Das Problem kann aufdringliche Gedanken, wiederholte Handlungen oder beides umfassen.",
          "Die Handlungen werden meist nicht aus Freude ausgeführt, sondern um Belastung zu verringern oder befürchtete Folgen zu verhindern.",
          "Sie ist spezifischer als allgemeiner Perfektionismus oder alltägliches Kontrollieren.",
          "Der englische Titel enthält zwei durch einen Bindestrich verbundene Adjektive."
        ],
        distractors: ["Körperdysmorphe Störung", "Generalisierte Angststörung"],
        aliases: ["zwang", "ocd", "zwangsgedanken"]
      }
    }
  },
  {
    id: "6B81",
    category: "eating",
    difficulty: 2,
    lang: {
      en: {
        title: "Anorexia nervosa",
        plainExplanation:
          "An eating disorder characterized by significantly low body weight for the person's context, persistent behaviours interfering with weight restoration, and overvaluation of weight or shape or related fears.",
        hints: [
          "This diagnosis belongs to feeding or eating disorders.",
          "Markedly low body weight for the person's context is a major clue.",
          "The pattern includes persistent behaviours that interfere with restoring weight.",
          "Body weight, shape, or related fears are central to the clinical picture.",
          "The second word in the title is shared with another classic eating disorder."
        ],
        distractors: ["Bulimia nervosa", "Binge eating disorder"],
        aliases: ["anorexia", "anorexia nervosa restricting"]
      },
      de: {
        title: "Anorexia nervosa",
        plainExplanation:
          "Eine Essstörung mit deutlich niedrigem Körpergewicht im jeweiligen Kontext, anhaltenden Verhaltensweisen gegen die Gewichtszunahme und einer starken Bedeutung von Gewicht, Figur oder entsprechenden Ängsten.",
        hints: [
          "Diese Diagnose gehört zu den Fütter- oder Essstörungen.",
          "Ein im jeweiligen Kontext deutlich niedriges Körpergewicht ist ein zentraler Hinweis.",
          "Das Muster umfasst anhaltende Verhaltensweisen, die eine Gewichtszunahme verhindern.",
          "Gewicht, Figur oder entsprechende Ängste stehen stark im Zentrum des klinischen Bildes.",
          "Das zweite Wort im Titel teilt sie mit einer anderen klassischen Essstörung."
        ],
        distractors: ["Bulimia nervosa", "Binge-Eating-Störung"],
        aliases: ["anorexie", "anorexia"]
      }
    }
  },
  {
    id: "6B82",
    category: "eating",
    difficulty: 2,
    lang: {
      en: {
        title: "Bulimia nervosa",
        plainExplanation:
          "An eating disorder marked by recurrent episodes of binge eating accompanied by recurrent inappropriate compensatory behaviours aimed at preventing weight gain.",
        hints: [
          "This diagnosis sits in feeding or eating disorders.",
          "Recurrent binge eating is one important clue.",
          "A second key feature is recurring compensatory behaviour intended to prevent weight gain.",
          "Unlike another well-known eating disorder, significantly low body weight is not required for the diagnosis.",
          "The title shares its second word with a different classic eating disorder."
        ],
        distractors: ["Anorexia nervosa", "Binge eating disorder"],
        aliases: ["bulimia", "bn"]
      },
      de: {
        title: "Bulimia nervosa",
        plainExplanation:
          "Eine Essstörung mit wiederkehrenden Essanfällen und wiederholten kompensatorischen Verhaltensweisen, die eine Gewichtszunahme verhindern sollen.",
        hints: [
          "Diese Diagnose gehört zu den Fütter- oder Essstörungen.",
          "Wiederkehrende Essanfälle sind ein wichtiger Hinweis.",
          "Ein zweites Kernmerkmal sind wiederholte kompensatorische Verhaltensweisen zur Verhinderung einer Gewichtszunahme.",
          "Im Unterschied zu einer anderen bekannten Essstörung ist deutlich niedriges Körpergewicht nicht erforderlich.",
          "Der Titel teilt sein zweites Wort mit einer anderen klassischen Essstörung."
        ],
        distractors: ["Anorexia nervosa", "Binge-Eating-Störung"],
        aliases: ["bulimie", "bulimia"]
      }
    }
  },
  {
    id: "6A02",
    category: "neurodevelopmental",
    difficulty: 2,
    lang: {
      en: {
        title: "Attention deficit hyperactivity disorder",
        plainExplanation:
          "A neurodevelopmental disorder involving persistent inattention and or hyperactivity-impulsivity that interferes with functioning across settings.",
        hints: [
          "This diagnosis belongs to neurodevelopmental disorders.",
          "Persistent inattention and or hyperactivity-impulsivity are central.",
          "The pattern should interfere with functioning across settings rather than only in one place.",
          "It is not simply occasional distractibility or high energy.",
          "The title is commonly shortened to four letters."
        ],
        distractors: ["Autism spectrum disorder", "Oppositional defiant disorder"],
        aliases: ["adhd", "attention deficit", "add"]
      },
      de: {
        title: "Aufmerksamkeitsdefizit-/Hyperaktivitätsstörung",
        plainExplanation:
          "Eine neuroentwicklungsbezogene Störung mit anhaltender Unaufmerksamkeit und oder Hyperaktivität-Impulsivität, die das Funktionieren in mehreren Lebensbereichen beeinträchtigt.",
        hints: [
          "Diese Diagnose gehört zu den neuroentwicklungsbezogenen Störungen.",
          "Anhaltende Unaufmerksamkeit und oder Hyperaktivität-Impulsivität stehen im Zentrum.",
          "Das Muster sollte das Funktionieren in mehreren Lebensbereichen beeinträchtigen und nicht nur an einem Ort auftreten.",
          "Es geht nicht bloss um gelegentliche Ablenkbarkeit oder viel Energie.",
          "Der englische Titel wird üblicherweise mit vier Buchstaben abgekürzt."
        ],
        distractors: ["Autismus-Spektrum-Störung", "Oppositionelle Trotzstörung"],
        aliases: ["adhs", "adhd", "aufmerksamkeitsdefizit"]
      }
    }
  },
  {
    id: "6A02.0",
    category: "neurodevelopmental",
    difficulty: 2,
    lang: {
      en: {
        title: "Autism spectrum disorder",
        plainExplanation:
          "A neurodevelopmental condition characterized by persistent differences in social interaction and communication together with restricted, repetitive, or inflexible patterns of behaviour, interests, or activities.",
        hints: [
          "This diagnosis belongs to neurodevelopmental disorders.",
          "Persistent differences in social interaction and communication are part of the picture.",
          "Restricted, repetitive, or inflexible patterns of behaviour, interests, or activities are also central.",
          "The diagnosis is defined as a spectrum rather than a single narrow presentation.",
          "The title contains a word often used for a range rather than one point."
        ],
        distractors: ["Attention deficit hyperactivity disorder", "Social anxiety disorder"],
        aliases: ["asd", "autism", "autistic spectrum disorder"]
      },
      de: {
        title: "Autismus-Spektrum-Störung",
        plainExplanation:
          "Eine neuroentwicklungsbezogene Störung mit anhaltenden Besonderheiten in sozialer Interaktion und Kommunikation sowie eingeschränkten, repetitiven oder unflexiblen Verhaltens-, Interessen- oder Aktivitätsmustern.",
        hints: [
          "Diese Diagnose gehört zu den neuroentwicklungsbezogenen Störungen.",
          "Anhaltende Besonderheiten in sozialer Interaktion und Kommunikation gehören zum Bild.",
          "Eingeschränkte, repetitive oder unflexible Muster von Verhalten, Interessen oder Aktivitäten sind ebenfalls zentral.",
          "Die Diagnose wird als Spektrum und nicht als eng umrissene Einzelpräsentation verstanden.",
          "Im Titel steht ein Wort, das eher auf einen Bereich als auf einen Punkt hinweist."
        ],
        distractors: ["Aufmerksamkeitsdefizit-/Hyperaktivitätsstörung", "Soziale Angststörung"],
        aliases: ["autismus", "asd", "autismus spektrum"]
      }
    }
  },
  {
    id: "6C4A",
    category: "substance",
    difficulty: 2,
    lang: {
      en: {
        title: "Alcohol dependence",
        plainExplanation:
          "A substance use condition in which alcohol use becomes a priority, control is impaired, and physiological or behavioural features of dependence are present.",
        hints: [
          "This diagnosis belongs to disorders due to substance use.",
          "The substance involved is legal in many places and socially common.",
          "Control over use becomes impaired and use may take increasing priority.",
          "Tolerance or withdrawal can fit, but the broader pattern of dependence matters.",
          "The first word in the title is the name of the substance itself."
        ],
        distractors: ["Harmful pattern of alcohol use", "Cannabis dependence"],
        aliases: ["alcohol use disorder", "alcohol dependence syndrome"]
      },
      de: {
        title: "Alkoholabhängigkeit",
        plainExplanation:
          "Eine substanzbezogene Störung, bei der Alkoholkonsum Priorität gewinnt, die Kontrolle beeinträchtigt ist und physiologische oder verhaltensbezogene Zeichen von Abhängigkeit vorliegen.",
        hints: [
          "Diese Diagnose gehört zu den Störungen aufgrund von Substanzkonsum.",
          "Die beteiligte Substanz ist in vielen Ländern legal und sozial verbreitet.",
          "Die Kontrolle über den Konsum nimmt ab und der Konsum kann zunehmend Priorität erhalten.",
          "Toleranz oder Entzug können passen, entscheidend ist aber das breitere Abhängigkeitsmuster.",
          "Das erste Wort im Titel bezeichnet direkt die Substanz."
        ],
        distractors: ["Schädliches Muster des Alkoholkonsums", "Cannabisabhängigkeit"],
        aliases: ["alkohol", "alkoholabhaengigkeit", "alcohol dependence"]
      }
    }
  }
];

function normalize(value) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ß/g, "ss")
    .replace(/[^a-z0-9\s-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function dateKey() {
  const now = new Date();
  const y = now.getUTCFullYear();
  const m = String(now.getUTCMonth() + 1).padStart(2, "0");
  const d = String(now.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function seededIndex(seed, max) {
  let hash = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    hash ^= seed.charCodeAt(i);
    hash += (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24);
  }
  return Math.abs(hash >>> 0) % max;
}

function loadJSON(key, fallback) {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function saveJSON(key, value) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(key, JSON.stringify(value));
}

function getLanguageLabel(lang) {
  return lang === "de" ? "Deutsch" : "English";
}

function shareEmojiGrid(guesses, solved, totalGuesses) {
  const rows = Array.from({ length: totalGuesses }, (_, i) => {
    if (i >= guesses.length) return "⬜";
    return guesses[i].correct ? "🟩" : "🟥";
  });
  return `${solved ? "Solved" : "Unsolved"} ${guesses.length}/${totalGuesses}\n${rows.join("")}`;
}

export default function ICD11MentalDisordersGame() {
  const [lang, setLang] = useState("en");
  const [query, setQuery] = useState("");
  const [guesses, setGuesses] = useState([]);
  const [message, setMessage] = useState("");
  const [mounted, setMounted] = useState(false);

  const today = dateKey();
  const dailyDiagnosis = useMemo(() => diagnoses[seededIndex(today, diagnoses.length)], [today]);
  const content = dailyDiagnosis.lang[lang];

  const storageKey = `${STORAGE_PREFIX}:state:${today}`;
  const streakKey = `${STORAGE_PREFIX}:streak`;

  useEffect(() => {
    setMounted(true);
    const savedState = loadJSON(storageKey, null);
    const savedLang = loadJSON(`${STORAGE_PREFIX}:lang`, "en");
    setLang(savedLang);
    if (savedState) {
      setGuesses(savedState.guesses || []);
      setMessage(savedState.message || "");
    }
  }, [storageKey]);

  useEffect(() => {
    if (!mounted) return;
    saveJSON(storageKey, { guesses, message });
  }, [mounted, storageKey, guesses, message]);

  useEffect(() => {
    if (!mounted) return;
    saveJSON(`${STORAGE_PREFIX}:lang`, lang);
  }, [mounted, lang]);

  const solved = guesses.some((g) => g.correct);
  const gameOver = solved || guesses.length >= MAX_GUESSES;
  const visibleHints = content.hints.slice(0, Math.min(guesses.length + 1, content.hints.length));

  const options = useMemo(() => {
    const q = normalize(query);
    if (!q) return diagnoses.slice(0, 8);
    return diagnoses
      .filter((d) => {
        const title = normalize(d.lang[lang].title);
        const aliases = (d.lang[lang].aliases || []).map(normalize);
        return title.includes(q) || aliases.some((a) => a.includes(q));
      })
      .slice(0, 8);
  }, [query, lang]);

  const streak = mounted
    ? loadJSON(streakKey, { current: 0, lastSolvedDate: null, best: 0 })
    : { current: 0, lastSolvedDate: null, best: 0 };

  function submitGuess(title) {
    if (gameOver) return;
    const guessDiagnosis = diagnoses.find((d) => normalize(d.lang[lang].title) === normalize(title));
    if (!guessDiagnosis) {
      setMessage(lang === "de" ? "Bitte wähle eine Diagnose aus der Liste." : "Please choose a diagnosis from the list.");
      return;
    }

    if (guesses.some((g) => g.id === guessDiagnosis.id)) {
      setMessage(lang === "de" ? "Diese Diagnose hast du bereits geraten." : "You already guessed that diagnosis.");
      return;
    }

    const correct = guessDiagnosis.id === dailyDiagnosis.id;
    const nextGuesses = [
      ...guesses,
      { id: guessDiagnosis.id, title: guessDiagnosis.lang[lang].title, correct }
    ];
    setGuesses(nextGuesses);
    setQuery("");

    if (correct) {
      const updated = updateStreak(today, streakKey);
      setMessage(
        lang === "de"
          ? `Richtig. Aktuelle Serie: ${updated.current}`
          : `Correct. Current streak: ${updated.current}`
      );
    } else if (nextGuesses.length >= MAX_GUESSES) {
      setMessage(lang === "de" ? "Keine Versuche mehr für heute." : "No guesses left for today.");
    } else {
      setMessage(lang === "de" ? "Nicht ganz. Der nächste Hinweis ist jetzt sichtbar." : "Not quite. The next hint is now visible.");
    }
  }

  function updateStreak(currentDate, key) {
    const existing = loadJSON(key, { current: 0, lastSolvedDate: null, best: 0 });
    if (existing.lastSolvedDate === currentDate) return existing;

    const previous = existing.lastSolvedDate ? new Date(existing.lastSolvedDate + "T00:00:00Z") : null;
    const current = new Date(currentDate + "T00:00:00Z");
    const dayMs = 24 * 60 * 60 * 1000;
    const diffDays = previous ? Math.round((current - previous) / dayMs) : null;

    const nextCurrent = diffDays === 1 ? existing.current + 1 : 1;
    const next = {
      current: nextCurrent,
      lastSolvedDate: currentDate,
      best: Math.max(existing.best || 0, nextCurrent)
    };
    saveJSON(key, next);
    return next;
  }

  async function copyShare() {
    const text = `ICD-11dle ${today} · ${getLanguageLabel(lang)}\n${shareEmojiGrid(guesses, solved, MAX_GUESSES)}`;
    try {
      await navigator.clipboard.writeText(text);
      setMessage(lang === "de" ? "Ergebnis kopiert." : "Result copied.");
    } catch {
      setMessage(text);
    }
  }

  function resetToday() {
    setGuesses([]);
    setQuery("");
    setMessage(lang === "de" ? "Heutiges Spiel wurde lokal zurückgesetzt." : "Today’s game was reset locally.");
    saveJSON(storageKey, { guesses: [], message: "" });
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-6">
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="rounded-2xl shadow-sm">
              <CardHeader className="space-y-4">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Brain className="h-4 w-4" />
                      ICD-11 mental disorders learning game
                    </div>
                    <CardTitle className="mt-2 text-3xl">ICD-11dle</CardTitle>
                    <CardDescription className="mt-2 max-w-2xl text-base leading-6">
                      {lang === "de"
                        ? "Tägliche Diagnose aus den psychischen, Verhaltens- oder neuroentwicklungsbezogenen Störungen erraten. Bildungszweck, nicht zur Selbstdiagnose."
                        : "Guess one ICD-11 diagnosis from mental, behavioural, or neurodevelopmental disorders each day. Educational only, not for self-diagnosis."}
                    </CardDescription>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button variant={lang === "en" ? "default" : "outline"} onClick={() => setLang("en")}>English</Button>
                    <Button variant={lang === "de" ? "default" : "outline"} onClick={() => setLang("de")}>Deutsch</Button>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary">{today}</Badge>
                  <Badge variant="secondary">{lang === "de" ? "Kapitel 06" : "Chapter 06"}</Badge>
                  <Badge variant="secondary">{lang === "de" ? "5 Versuche" : "5 guesses"}</Badge>
                </div>
              </CardHeader>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
            <Card className="rounded-2xl shadow-sm">
              <CardHeader>
                <CardTitle className="text-xl">{lang === "de" ? "Raten" : "Guess"}</CardTitle>
                <CardDescription>
                  {lang === "de"
                    ? "Suche nach der offiziellen Diagnosebezeichnung in deiner gewählten Sprache."
                    : "Search for the official diagnosis label in your selected language."}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder={lang === "de" ? "Diagnose suchen" : "Search diagnosis"}
                    className="pl-9"
                    disabled={gameOver}
                  />
                </div>

                {query && !gameOver && (
                  <div className="grid gap-2 rounded-2xl border p-2">
                    {options.length ? (
                      options.map((option) => (
                        <button
                          key={option.id}
                          onClick={() => submitGuess(option.lang[lang].title)}
                          className="rounded-xl px-3 py-2 text-left text-sm transition hover:bg-muted"
                        >
                          <div className="font-medium">{option.lang[lang].title}</div>
                          <div className="text-xs text-muted-foreground">{option.id}</div>
                        </button>
                      ))
                    ) : (
                      <div className="px-2 py-1 text-sm text-muted-foreground">
                        {lang === "de" ? "Keine passenden Diagnosen gefunden." : "No matching diagnoses found."}
                      </div>
                    )}
                  </div>
                )}

                <div className="grid gap-2">
                  {Array.from({ length: MAX_GUESSES }).map((_, index) => {
                    const guess = guesses[index];
                    return (
                      <div
                        key={index}
                        className={`flex min-h-12 items-center justify-between rounded-2xl border px-4 py-3 ${guess ? (guess.correct ? "border-green-500" : "border-red-500") : ""}`}
                      >
                        <span className="text-sm md:text-base">{guess ? guess.title : lang === "de" ? `Versuch ${index + 1}` : `Guess ${index + 1}`}</span>
                        {guess ? guess.correct ? <CheckCircle2 className="h-5 w-5" /> : <XCircle className="h-5 w-5" /> : null}
                      </div>
                    );
                  })}
                </div>

                {message ? (
                  <div className="rounded-2xl bg-muted px-4 py-3 text-sm">{message}</div>
                ) : null}

                <div className="flex flex-wrap gap-2">
                  <Button onClick={copyShare} variant="outline">
                    <Share2 className="mr-2 h-4 w-4" />
                    {lang === "de" ? "Ergebnis teilen" : "Share result"}
                  </Button>
                  <Button onClick={resetToday} variant="ghost">
                    <RotateCcw className="mr-2 h-4 w-4" />
                    {lang === "de" ? "Lokal zurücksetzen" : "Reset locally"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card className="rounded-2xl shadow-sm">
              <CardHeader>
                <CardTitle className="text-xl">{lang === "de" ? "Hinweise" : "Hints"}</CardTitle>
                <CardDescription>
                  {lang === "de"
                    ? "Nach jedem falschen Versuch wird ein weiterer Hinweis freigeschaltet."
                    : "A new hint unlocks after each incorrect guess."}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {visibleHints.map((hint, index) => (
                  <div key={index} className="flex items-start gap-3 rounded-2xl border p-4">
                    <Lightbulb className="mt-0.5 h-4 w-4 shrink-0" />
                    <div>
                      <div className="text-xs uppercase tracking-wide text-muted-foreground">
                        {lang === "de" ? `Hinweis ${index + 1}` : `Hint ${index + 1}`}
                      </div>
                      <div className="mt-1 text-sm leading-6">{hint}</div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>
        </div>

        <div className="space-y-6">
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
            <Card className="rounded-2xl shadow-sm">
              <CardHeader>
                <CardTitle className="text-xl">{lang === "de" ? "Fortschritt" : "Progress"}</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
                <div className="rounded-2xl border p-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Flame className="h-4 w-4" />
                    {lang === "de" ? "Aktuelle Serie" : "Current streak"}
                  </div>
                  <div className="mt-2 text-3xl font-semibold">{streak.current || 0}</div>
                </div>
                <div className="rounded-2xl border p-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CheckCircle2 className="h-4 w-4" />
                    {lang === "de" ? "Beste Serie" : "Best streak"}
                  </div>
                  <div className="mt-2 text-3xl font-semibold">{streak.best || 0}</div>
                </div>
                <div className="rounded-2xl border p-4 sm:col-span-2 lg:col-span-1 xl:col-span-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Globe className="h-4 w-4" />
                    {lang === "de" ? "Sprache" : "Language"}
                  </div>
                  <div className="mt-2 text-lg font-medium">{getLanguageLabel(lang)}</div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <Card className="rounded-2xl shadow-sm">
              <CardHeader>
                <CardTitle className="text-xl">{lang === "de" ? "Lösung" : "Solution"}</CardTitle>
                <CardDescription>
                  {gameOver
                    ? lang === "de"
                      ? "Die heutige Diagnose und die Lernnotiz."
                      : "Today’s diagnosis and study note."
                    : lang === "de"
                      ? "Wird nach der Lösung oder nach 5 Versuchen angezeigt."
                      : "Shown after you solve it or use all 5 guesses."}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {gameOver ? (
                  <div className="space-y-4">
                    <div>
                      <div className="text-sm text-muted-foreground">ICD-11</div>
                      <div className="mt-1 text-2xl font-semibold">{content.title}</div>
                      <div className="mt-1 text-sm text-muted-foreground">{dailyDiagnosis.id}</div>
                    </div>
                    <div className="rounded-2xl border p-4 text-sm leading-6">
                      {content.plainExplanation}
                    </div>
                    <div>
                      <div className="mb-2 text-sm font-medium text-muted-foreground">
                        {lang === "de" ? "Leicht verwechselbar mit" : "Often confused with"}
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {content.distractors.map((item) => (
                          <Badge key={item} variant="secondary">{item}</Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-2xl border border-dashed p-4 text-sm text-muted-foreground">
                    {lang === "de"
                      ? "Löse das Rätsel oder verbrauche alle Versuche, um die vollständige Lernkarte zu sehen."
                      : "Solve the puzzle or use all guesses to unlock the full study card."}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
            <Card className="rounded-2xl shadow-sm">
              <CardHeader>
                <CardTitle className="text-xl">{lang === "de" ? "Nächste sinnvolle Schritte" : "Next sensible steps"}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm leading-6 text-muted-foreground">
                <p>
                  {lang === "de"
                    ? "1. Erweitere den kuratierten Pool auf 30 bis 50 Diagnosen aus Kapitel 06."
                    : "1. Expand the curated pool to 30 to 50 diagnoses from Chapter 06."}
                </p>
                <p>
                  {lang === "de"
                    ? "2. Ersetze das lokale Array durch Daten aus einer Datenbank und nutze die WHO ICD API für Referenz und Validierung."
                    : "2. Replace the local array with database-backed content and use the WHO ICD API for reference and validation."}
                </p>
                <p>
                  {lang === "de"
                    ? "3. Füge Analytics, SEO, Ad-Slots und eine About-Seite mit Attribution und Disclaimer hinzu."
                    : "3. Add analytics, SEO, ad slots, and an about page with attribution and disclaimers."}
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
