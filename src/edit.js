import { __ } from '@wordpress/i18n';

import { useBlockProps, InspectorControls } from '@wordpress/block-editor';
import { useSelect } from '@wordpress/data';
import { FormTokenField, PanelBody, SelectControl, Placeholder } from '@wordpress/components';
import { useState, useEffect } from '@wordpress/element';
import RelatedArticlesPost from './post';

import './editor.scss';


export default function Edit({ attributes, setAttributes }) {
	const { posts, fallback } = attributes;

	let postsSuggestions = []
	const postsSuggestionsNames = useSelect((select) => {
		postsSuggestions = select( 'core' ).getEntityRecords( 'postType', 'post', { status : 'publish' } )
		return postsSuggestions ? postsSuggestions.map(post => post.title.rendered) : []
	}, [postsSuggestions])

	const postsFieldValue = useSelect((select) => {
		const postsRaw = select('core').getEntityRecords('postType', 'post', { include: posts })
		return postsRaw ? postsRaw.map(post => post.title.rendered) : []
	}, [posts])

	const onSaveTokens = (tokens) => {
		let selectedPosts = []
		tokens.forEach(postTitle => {
			const post = postsSuggestions.find(post => post.title.rendered === postTitle)
			if (post) {
				selectedPosts.push(post.id)
			}
		})
		setAttributes({ posts: selectedPosts });
	}

	const hasSelectedPosts = !!posts.length;

	return (
		<>
			<InspectorControls>
				<PanelBody title={__('Block behavior', 'monocle-related-articles')} initialOpen>
					<SelectControl
						label={__('Dynamic content?', 'monocle-related-articles')}
						value={fallback}
						options={[
							{ label: __('No, show the hand-picked items', 'monocle-related-articles'), value: '' },
							{ label: __('Yes, 3 most recent articles matching tags', 'monocle-related-articles'), value: 'post_tag' },
							{
								label: __('Yes, 3 most recent articles matching categories', 'monocle-related-articles'),
								value: 'category',
							},
							{
								label: __('Yes, 3 most recent articles with the same post type', 'monocle-related-articles'),
								value: 'post_type',
							},
						]}
						onChange={(newValue) => setAttributes({ fallback: newValue })}
					/>
					{!fallback && (
						<FormTokenField
							label={__('Handpicked posts', 'monocle-related-articles')}
							value={postsFieldValue}
							maxLength={3}
							suggestions={postsSuggestionsNames}
							onChange={(newValue) => onSaveTokens(newValue)}
						/>
					)}
				</PanelBody>
			</InspectorControls>
			<div {...useBlockProps()}>
				<div className="monocle-related-articles__inside">
					{fallback !== '' && (
						<Placeholder label={__('Related articles', 'monocle-related-articles')}>
							{__('The content is dynamical.', 'monocle-related-articles')}
							<br />
							{__(
								'You have to switch to no fallback if you need explicitly hand-picked articles.',
								'monocle-related-articles',
							)}
						</Placeholder>
					)}

					{fallback === '' && (
						<>
							{hasSelectedPosts && (
								<ul className="monocle-related-articles__list">
									{posts.map((post) => (
										<RelatedArticlesPost key={post} id={post} />
									))}
								</ul>
							)}

							{!hasSelectedPosts && (
								<Placeholder
									icon="admin-post"
									label={__('Related articles', 'monocle-related-articles')}
									instructions={__('Select posts to get started', 'monocle-related-articles')}
								/>
							)}
						</>
					)}
				</div>
			</div>
		</>
	)
}
