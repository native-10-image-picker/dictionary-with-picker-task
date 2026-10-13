import { createSlice, createSelector } from "@reduxjs/toolkit";
import { INITIAL_FORGETTING_SPAN } from "../constants";

const initialState = {
  words: [],
};

const wordsLearningSlice = createSlice({
  name: "words",
  initialState,
  reducers: {
    updateWordLearnInfo(state, action) {
      const wordInfoToUpdate = state.words.find(
        (wordInfo) => wordInfo.word === action.payload
      );

      if (!wordInfoToUpdate) return;

      const now = Date.now();

      wordInfoToUpdate.dateForgets =
        now + wordInfoToUpdate.forgettingSpan;

      wordInfoToUpdate.forgettingSpan *= 2;

      wordInfoToUpdate.dateTotallyForgets =
        now + wordInfoToUpdate.forgettingSpan;

      wordInfoToUpdate.status = 2;
    },

    addWord(state, action) {
      if (state.words.some((word) => word.word === action.payload.word)) {
        return;
      }

      const now = Date.now();
      const selectedImage =
        action.payload.imageUri ?? action.payload.image;

      const wordData = {
        ...action.payload,
        image: selectedImage,
        imageUri: selectedImage,
        dateForgets: now - INITIAL_FORGETTING_SPAN,
        dateTotallyForgets: now,
        forgettingSpan: INITIAL_FORGETTING_SPAN,
        status: 0,
      };

      state.words.push(wordData);
    },

    updateWord(state, action) {
      const index = state.words.findIndex(
        (wordInfo) => wordInfo.word === action.payload.word
      );

      if (index === -1) return;

      const existingWord = state.words[index];
      const selectedImage =
        action.payload.imageUri ??
        action.payload.image ??
        existingWord.imageUri ??
        existingWord.image ??
        null;

      state.words[index] = {
        ...existingWord,
        ...action.payload,
        image: selectedImage,
        imageUri: selectedImage,
      };
    },

    removeWord(state, action) {
      state.words = state.words.filter(
        (item) => item.word !== action.payload
      );
    },

    updateStatuses(state) {
      const now = Date.now();

      for (const wordInfo of state.words) {
        if (wordInfo.dateTotallyForgets <= now) {
          wordInfo.status = 0;
        } else if (
          wordInfo.dateForgets <= now &&
          wordInfo.dateTotallyForgets > now
        ) {
          wordInfo.status = 1;
        }
      }
    },
  },
});

export const selectWordsToLearn = createSelector(
  (state) => state.wordsLearning.words,
  (words) => words.filter((word) => word.status < 2)
);

export const wordsLearningActions = wordsLearningSlice.actions;

export default wordsLearningSlice;