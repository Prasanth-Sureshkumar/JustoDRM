// Mock data for testing - replace with actual API calls when available

const mockAudios = [
  {
    id: 1,
    name: "The Great Gatsby",
    authorName: "F. Scott Fitzgerald",
    cover: "https://picsum.photos/200/300?random=1",
    duration: "5h 32m",
    audioUrl: "https://example.com/audio1.mp3",
    description: "A classic American novel set in the Jazz Age, exploring themes of decadence, idealism, and the American Dream."
  },
  {
    id: 2,
    name: "To Kill a Mockingbird",
    authorName: "Harper Lee",
    cover: "https://picsum.photos/200/300?random=2",
    duration: "12h 18m",
    audioUrl: "https://example.com/audio2.mp3",
    description: "A gripping tale of racial injustice and childhood innocence in the American South."
  },
  {
    id: 3,
    name: "1984",
    authorName: "George Orwell",
    cover: "https://picsum.photos/200/300?random=3",
    duration: "8h 45m",
    audioUrl: "https://example.com/audio3.mp3",
    description: "A dystopian novel that explores themes of totalitarianism, surveillance, and individual freedom."
  },
  {
    id: 4,
    name: "Pride and Prejudice",
    authorName: "Jane Austen",
    cover: "https://picsum.photos/200/300?random=4",
    duration: "11h 35m",
    audioUrl: "https://example.com/audio4.mp3",
    description: "A romantic novel that critiques the British landed gentry at the end of the 18th century."
  },
  {
    id: 5,
    name: "The Catcher in the Rye",
    authorName: "J.D. Salinger",
    cover: "https://picsum.photos/200/300?random=5",
    duration: "6h 22m",
    audioUrl: "https://example.com/audio5.mp3",
    description: "A controversial coming-of-age story told through the eyes of teenager Holden Caulfield."
  },
  {
    id: 6,
    name: "Harry Potter and the Sorcerer's Stone",
    authorName: "J.K. Rowling",
    cover: "https://picsum.photos/200/300?random=6",
    duration: "8h 17m",
    audioUrl: "https://example.com/audio6.mp3",
    description: "The first book in the beloved Harry Potter series about a young wizard's journey."
  }
];

export const fetchAllAudiosMock = async () => {
  // Simulate network delay
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(mockAudios);
    }, 1000);
  });
};

export const fetchIndividualAudioMock = async (audioId) => {
  // Simulate network delay
  return new Promise((resolve) => {
    setTimeout(() => {
      const audio = mockAudios.find(a => a.id === audioId);
      resolve(audio);
    }, 500);
  });
};
