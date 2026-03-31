/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                'primary': '#a04100',
                'primary-container': '#ff6b00',
                'secondary': '#3b6934',
                'secondary-container': '#b9eeab',
                'surface': '#f8f9fa',
                'surface-low': '#f3f4f5',
                'surface-lowest': '#ffffff',
                'surface-container-low': '#f3f4f5',
                'surface-container-lowest': '#ffffff',
                'surface-container': '#edeeef',
                'surface-container-high': '#e7e8e9',
                'surface-container-highest': '#e1e3e4',
                'on-surface': '#191c1d',
                'on-surface-variant': '#5a4136',
                'on-primary': '#ffffff',
                'outline': '#8e7164',
                'outline-variant': '#e2bfb0',
                'inverse-surface': '#2e3132',
                'inverse-on-surface': '#f0f1f2',
            },
            fontFamily: {
                headline: ['Lexend', 'sans-serif'],
                body: ['Inter', 'sans-serif'],
                display: ['Lexend', 'sans-serif'],
                label: ['Inter', 'sans-serif'],
            },
        },
    },
    plugins: [],
};
