import React from 'react';
import { Link } from 'react-router-dom';
import { FiArrowRight, FiMapPin, FiClock, FiStar } from 'react-icons/fi';

const HomePage: React.FC = () => {
    const features = [
        {
            icon: <FiMapPin className="text-2xl" />,
            title: 'Find Nearby Turfs',
            description: 'Discover the best football pitches near you',
        },
        {
            icon: <FiClock className="text-2xl" />,
            title: 'Easy Booking',
            description: 'Book your turf in just a few clicks',
        },
        {
            icon: <FiStar className="text-2xl" />,
            title: 'Top Rated',
            description: 'Browse turfs with verified reviews',
        },
    ];

    return (
        <div className="min-h-screen">
            {/* Hero Section */}
            <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-20">
                <div className="max-w-7xl mx-auto px-4 text-center">
                    <h1 className="text-5xl font-bold mb-4">Book Your Perfect Turf</h1>
                    <p className="text-xl text-blue-100 mb-8">
                        Find and book the best football pitches in your area instantly
                    </p>
                    <div className="flex gap-4 justify-center">
                        <Link to="/browse" className="btn-primary bg-white text-blue-600 hover:bg-gray-100">
                            Browse Turfs <FiArrowRight className="inline ml-2" />
                        </Link>
                        <Link to="/register" className="btn-primary bg-blue-700 hover:bg-blue-800">
                            Get Started
                        </Link>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-16 max-w-7xl mx-auto px-4">
                <h2 className="text-3xl font-bold text-center mb-12">Why Choose TurfBook?</h2>
                <div className="grid md:grid-cols-3 gap-8">
                    {features.map((feature, idx) => (
                        <div key={idx} className="card text-center">
                            <div className="text-blue-600 mb-4 flex justify-center">{feature.icon}</div>
                            <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                            <p className="text-gray-600">{feature.description}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* CTA Section */}
            <section className="bg-gray-100 py-16">
                <div className="max-w-4xl mx-auto px-4 text-center">
                    <h2 className="text-3xl font-bold mb-4">Ready to book your next match?</h2>
                    <p className="text-gray-600 mb-8 text-lg">
                        Browse hundreds of turfs and book your preferred time slot today!
                    </p>
                    <Link to="/browse" className="btn-primary">
                        Browse Turfs Now
                    </Link>
                </div>
            </section>
        </div>
    );
};

export default HomePage;
