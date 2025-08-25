/**
 * 導航類型定義
 */

export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
};

export type AuthStackParamList = {
  Welcome: undefined;
  Login: undefined;
  Register: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Explore: undefined;
  Profile: undefined;
};

export type NavigationProps = {
  navigation: any;
  route?: any;
};
