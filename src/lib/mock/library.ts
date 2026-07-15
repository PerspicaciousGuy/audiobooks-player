import type { Audiobook } from "@/types/audiobook";

export const MOCK_AUDIOBOOKS: readonly Audiobook[] = [
  {
    id: "the-left-hand-of-darkness",
    title: "The Left Hand of Darkness",
    author: "Ursula K. Le Guin",
    narrator: "George Guidall",
    description:
      "A lone human envoy travels to the winter world of Gethen, where trust, loyalty, and identity take unfamiliar forms.",
    coverTone: "sky",
    progressPercent: 42,
    progressLabel: "4 hr 18 min left",
    duration: "9 hr 39 min",
    currentChapter: "Chapter 7 · The Question of Sex",
    fileCount: 1,
    format: "M4B",
    isDownloaded: true,
    chapters: [
      {
        id: "winter-king",
        title: "A Parade in Erhenrang",
        duration: "38 min",
        startTime: "00:00",
        isCurrent: false,
      },
      {
        id: "place-inside-blizzard",
        title: "The Place Inside the Blizzard",
        duration: "42 min",
        startTime: "38:12",
        isCurrent: false,
      },
      {
        id: "question-of-sex",
        title: "The Question of Sex",
        duration: "51 min",
        startTime: "1:20:44",
        isCurrent: true,
      },
      {
        id: "nineteenth-day",
        title: "The Nineteenth Day",
        duration: "46 min",
        startTime: "2:11:20",
        isCurrent: false,
      },
    ],
    bookmarks: [
      {
        id: "bookmark-trust",
        label: "On trust and certainty",
        chapterTitle: "The Question of Sex",
        timestamp: "1:44:08",
      },
      {
        id: "bookmark-winter",
        label: "Return to this description",
        chapterTitle: "The Place Inside the Blizzard",
        timestamp: "54:31",
      },
    ],
  },
  {
    id: "braiding-sweetgrass",
    title: "Braiding Sweetgrass",
    author: "Robin Wall Kimmerer",
    narrator: "Robin Wall Kimmerer",
    description:
      "Indigenous wisdom, scientific knowledge, and the teachings of plants are woven into an invitation to reciprocity.",
    coverTone: "forest",
    progressPercent: 18,
    progressLabel: "13 hr 27 min left",
    duration: "16 hr 44 min",
    currentChapter: "The Council of Pecans",
    fileCount: 12,
    format: "MP3",
    isDownloaded: false,
    chapters: [],
    bookmarks: [],
  },
  {
    id: "piranesi",
    title: "Piranesi",
    author: "Susanna Clarke",
    narrator: "Chiwetel Ejiofor",
    description:
      "Within an infinite house of statues, tides, and cloud-filled halls, one inhabitant records the wonders around him.",
    coverTone: "ink",
    progressPercent: 0,
    progressLabel: "Not started",
    duration: "6 hr 58 min",
    currentChapter: "Part One",
    fileCount: 1,
    format: "M4B",
    isDownloaded: false,
    chapters: [],
    bookmarks: [],
  },
  {
    id: "the-overstory",
    title: "The Overstory",
    author: "Richard Powers",
    narrator: "Suzanne Toren",
    description:
      "Nine lives converge around a shared, unfolding realization about trees and the living world.",
    coverTone: "amber",
    progressPercent: 76,
    progressLabel: "5 hr 12 min left",
    duration: "22 hr 58 min",
    currentChapter: "Crown",
    fileCount: 3,
    format: "MP3",
    isDownloaded: true,
    chapters: [],
    bookmarks: [],
  },
  {
    id: "sea-of-tranquility",
    title: "Sea of Tranquility",
    author: "Emily St. John Mandel",
    narrator: "A full cast",
    description:
      "A story of art, time, love, and plague that stretches from Vancouver Island to a dark colony on the moon.",
    coverTone: "plum",
    progressPercent: 100,
    progressLabel: "Finished",
    duration: "5 hr 20 min",
    currentChapter: "Last Words",
    fileCount: 1,
    format: "M4A",
    isDownloaded: false,
    chapters: [],
    bookmarks: [],
  },
  {
    id: "the-book-of-delights",
    title: "The Book of Delights",
    author: "Ross Gay",
    narrator: "Ross Gay",
    description:
      "A collection of lyrical essays celebrating the small wonders that gather in an ordinary year.",
    coverTone: "rose",
    progressPercent: 9,
    progressLabel: "4 hr 6 min left",
    duration: "4 hr 31 min",
    currentChapter: "The Joy of Caring",
    fileCount: 47,
    format: "MP3",
    isDownloaded: false,
    chapters: [],
    bookmarks: [],
  },
];

const currentAudiobook = MOCK_AUDIOBOOKS[0];

if (currentAudiobook === undefined) {
  throw new Error("The mock library requires a current audiobook.");
}

export const CURRENT_AUDIOBOOK = currentAudiobook;

export function getAudiobookById(id: string): Audiobook | undefined {
  return MOCK_AUDIOBOOKS.find((audiobook) => audiobook.id === id);
}
