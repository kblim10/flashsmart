import { extendTheme } from 'native-base';

// Palet warna dari dokumentasi
const colors = {
  primary: {
    50: '#E3EEF5',
    100: '#C7DDEB',
    200: '#ABCCE1',
    300: '#8FBBD7',
    400: '#73AACE',
    500: '#6C9BC0', // biru pastel
    600: '#5686AC',
    700: '#417298',
    800: '#2C5E84',
    900: '#174A70',
  },
  secondary: {
    50: '#EFF7F2',
    100: '#DFEEE5',
    200: '#CFE6D8',
    300: '#BFDDCB',
    400: '#AED5BE',
    500: '#A8D8B9', // hijau pastel
    600: '#8AC6A2',
    700: '#6CB58B',
    800: '#4EA374',
    900: '#30925D',
  },
  accent: {
    50: '#FFF9E6',
    100: '#FFF3CC',
    200: '#FFEDB3',
    300: '#FFE799',
    400: '#FFDF80',
    500: '#FFD166', // kuning cerah
    600: '#FFC433',
    700: '#FFB800',
    800: '#E6A600',
    900: '#CC9300',
  },
  background: '#F8F9FA',
};

// Konfigurasi tema
export const theme = extendTheme({
  colors,
  fontConfig: {
    Roboto: {
      400: {
        normal: 'Roboto-Regular',
      },
      500: {
        normal: 'Roboto-Medium',
      },
      700: {
        normal: 'Roboto-Bold',
      },
    },
  },
  fonts: {
    heading: 'Roboto',
    body: 'Roboto',
    mono: 'Roboto',
  },
  config: {
    initialColorMode: 'light',
  },
  components: {
    Button: {
      baseStyle: {
        rounded: 'md',
      },
      defaultProps: {
        colorScheme: 'primary',
      },
    },
    Input: {
      baseStyle: {
        borderColor: 'gray.300',
      },
      defaultProps: {
        focusOutlineColor: 'primary.500',
      },
    },
  },
});

export type CustomThemeType = typeof theme; 