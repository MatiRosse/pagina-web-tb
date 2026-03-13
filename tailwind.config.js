/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ["./*.html", "./**/*.html", "./js/**/*.js"],
    theme: {
        extend: {
            colors: {
                darkblue: {
                    900: '#333333',
                    800: '#4A4A4A',
                    700: '#5A5A5A'
                },
                gold: {
                    DEFAULT: '#c5a059',
                    hover: '#b08d4b',
                    light: '#f9f6f0'
                }
            },
            fontFamily: {
                serif: ['Playfair Display', 'serif'],
                sans: ['Inter', 'sans-serif'],
            },
            keyframes: {
                pan: {
                    '0%': { transform: 'scale(1.05) translate(0, 0)' },
                    '100%': { transform: 'scale(1.1) translate(-2%, 2%)' }
                }
            },
            animation: {
                pan: 'pan 20s ease-in-out infinite alternate',
            }
        }
    },
    plugins: [],
}
