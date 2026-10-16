if (typeof tailwind !== 'undefined') {
    tailwind.config = {
        theme: {
            extend: {
                fontFamily: {
                    space: ['"Space Grotesk"', 'sans-serif'],
                },
                colors: {
                    base: '#000000',
                    panel: '#0a0a0a',
                    muted: '#D2E1E8',
                    dim: '#7192A5',
                    accent: '#38BDF8',
                },
                backgroundImage: {
                    'grid-pattern': 'radial-gradient(rgba(255, 255, 255, 0.02) 2px, transparent 2px)',
                },
            },
        },
    };
}
