import type { NavigatorScreenParams } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { MediaType } from '../api/types';

export type DetailParams = {
  mediaType: MediaType;
  id: number;
};

export type MovieListKind = 'trending' | 'topRated' | 'genre';

export type MovieListParams = {
  kind: MovieListKind;
  title: string;
  genreId?: number;
};

export type HomeStackParamList = {
  HomeMain: undefined;
  MovieList: MovieListParams;
};

export type SearchStackParamList = {
  SearchMain: undefined;
};

export type WatchlistStackParamList = {
  WatchlistMain: undefined;
};

export type ProfileStackParamList = {
  ProfileMain: undefined;
};

export type RootTabParamList = {
  HomeTab: NavigatorScreenParams<HomeStackParamList>;
  SearchTab: NavigatorScreenParams<SearchStackParamList>;
  WatchlistTab: NavigatorScreenParams<WatchlistStackParamList>;
  ProfileTab: NavigatorScreenParams<ProfileStackParamList>;
};

export type RootStackParamList = {
  Tabs: NavigatorScreenParams<RootTabParamList>;
  Detail: DetailParams;
};

export type HomeStackProps = NativeStackScreenProps<HomeStackParamList, 'HomeMain'>;
export type SearchStackProps = NativeStackScreenProps<SearchStackParamList, 'SearchMain'>;
export type DetailScreenProps = NativeStackScreenProps<RootStackParamList, 'Detail'>;
