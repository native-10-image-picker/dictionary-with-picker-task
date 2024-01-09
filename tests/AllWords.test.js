import { Image } from "react-native";
import { render, screen, userEvent, act } from "@testing-library/react-native";

import { Provider } from "react-redux";
import store from "../store";
import { wordsLearningActions } from "../store/wordsLearningSlice";
import * as constants from "../constants";
import words from "./testData";
import MainNavigator from "../navigators/MainNavigator";

constants.INITIAL_FORGETTING_SPAN = 1000 / 2;
constants.REFRESH_STATUSES_SPAN = 1000;

afterEach(() => {
  jest.useRealTimers();
});

test(`Shows corresponding images near the words`, async () => {
  jest.useFakeTimers();
  const user = userEvent.setup();
  await act(async () => {
    store.dispatch(
      wordsLearningActions.addWord({ ...words[0], image: "some_uri" })
    );
  });
  await act(async () => {
    store.dispatch(wordsLearningActions.addWord({ ...words[1] }));
  });
  await act(async () => {
    store.dispatch(wordsLearningActions.addWord({ ...words[2] }));
  });

  render(
    <Provider store={store}>
      <MainNavigator />
    </Provider>
  );

  const images = screen.UNSAFE_getAllByType(Image);
  expect(images).toHaveLength(4); //one title image and 2 images with words

  expect(images[1].props.source).toEqual({ uri: "some_uri" });
  expect(images[2].props.source.uri).not.toBeDefined();
  expect(images[3].props.source.uri).not.toBeDefined();
});
