import React from 'react';
import HeroSection from '../components/HeroSection';
import SectionHeading from '../components/SectionHeading';
import RecipeCard from '../components/RecipeCard';

const recentlyViewedRecipes = [
	{
		id: '1',
		title: 'Peat Plas',
		category: 'Recipes',
		image: 'https://images.pexels.com/photos/1279330/pexels-photo-1279330.jpeg?auto=compress&cs=tinysrgb&w=600',
	},
	{
		id: '2',
		title: 'Slong Hoas',
		category: 'Recipes',
		image: 'https://images.pexels.com/photos/699953/pexels-photo-699953.jpeg?auto=compress&cs=tinysrgb&w=600',
	},
	{
		id: '3',
		title: 'Scaden Foed',
		category: 'Recipes',
		image: 'https://images.pexels.com/photos/1640772/pexels-photo-1640772.jpeg?auto=compress&cs=tinysrgb&w=600',
	},
	{
		id: '4',
		title: 'Uve Trass',
		category: 'Recipes',
		image: 'https://images.pexels.com/photos/1640774/pexels-photo-1640774.jpeg?auto=compress&cs=tinysrgb&w=600',
	},
	{
		id: '5',
		title: 'Drecien',
		category: 'Now',
		image: 'https://images.pexels.com/photos/406152/pexels-photo-406152.jpeg?auto=compress&cs=tinysrgb&w=600',
	},
	{
		id: '6',
		title: 'Mech',
		category: 'Recipes',
		image: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=600',
	},
];

const categoryRecipes = [
	{
		id: '7',
		title: 'En Garey',
		category: 'Breakfast',
		image: 'https://images.pexels.com/photos/376464/pexels-photo-376464.jpeg?auto=compress&cs=tinysrgb&w=600',
		prepTime: '25 min',
		servings: 4,
	},
	{
		id: '8',
		title: 'Mod Phy',
		category: 'Lunch',
		image: 'https://images.pexels.com/photos/958545/pexels-photo-958545.jpeg?auto=compress&cs=tinysrgb&w=600',
		prepTime: '35 min',
		servings: 2,
	},
	{
		id: '9',
		title: 'Shrexctay',
		category: 'Dinner',
		image: 'https://images.pexels.com/photos/1279330/pexels-photo-1279330.jpeg?auto=compress&cs=tinysrgb&w=600',
		prepTime: '45 min',
		servings: 6,
	},
	{
		id: '10',
		title: 'Inves Satier',
		category: 'Dessert',
		image: 'https://images.pexels.com/photos/291528/pexels-photo-291528.jpeg?auto=compress&cs=tinysrgb&w=600',
		prepTime: '15 min',
		servings: 8,
	},
	{
		id: '11',
		title: 'Tiae Sanee',
		category: 'Breakfast',
		image: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=600',
		prepTime: '20 min',
		servings: 2,
	},
	{
		id: '12',
		title: 'Cherdonty',
		category: 'Dinner',
		image: 'https://images.pexels.com/photos/262959/pexels-photo-262959.jpeg?auto=compress&cs=tinysrgb&w=600',
		prepTime: '55 min',
		servings: 4,
	},
];

const HomePage: React.FC = () => {
	const handleEdit = (id: string) => {
		console.log(`Edit recipe with id: ${id}`);
		// Implement edit functionality here
	};

	const handleDelete = (id: string) => {
		console.log(`Delete recipe with id: ${id}`);
		// Implement delete functionality here
	};

	return (
		<>
			<HeroSection />

			<div className="container mx-auto px-4 py-8">
				{/* Recently Viewed Recipes */}
				<section className="mb-12 animate-slide-up">
					<SectionHeading
						title="Recently viewed Recipes"
						viewAllLink="/recipes?filter=recent"
					/>

					<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-3 gap-4">
						{recentlyViewedRecipes.map((recipe) => (
							<RecipeCard
								key={recipe.id}
								id={recipe.id}
								title={recipe.title}
								category={recipe.category}
								image={recipe.image}
								onEdit={handleEdit}
								onDelete={handleDelete}
							/>
						))}
					</div>
				</section>

				{/* Category Recipes */}
				<section
					className="animate-slide-up"
					style={{ animationDelay: '0.2s' }}
				>
					<SectionHeading title="Category Recipes" viewAllLink="/recipes" />

					<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-6 gap-6">
						{categoryRecipes.map((recipe) => (
							<RecipeCard
								key={recipe.id}
								id={recipe.id}
								title={recipe.title}
								category={recipe.category}
								image={recipe.image}
								prepTime={recipe.prepTime}
								servings={recipe.servings}
								onEdit={handleEdit}
								onDelete={handleDelete}
							/>
						))}
					</div>
				</section>
			</div>
		</>
	);
};

export default HomePage;
