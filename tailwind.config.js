/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                'primary': '#ec5b13',
                'primary-container': '#ff6b00',
                'secondary': '#3b6934',
                'surface': '#f8f9fa',
                'surface-low': '#f3f4f5',
                'surface-lowest': '#ffffff',
                'on-surface': '#191c1d',
            },
            fontFamily: {
                display: ['Lexend', 'sans-serif'],
                body: ['Inter', 'sans-serif'],
            },
        },
    },
    plugins: [],
};
