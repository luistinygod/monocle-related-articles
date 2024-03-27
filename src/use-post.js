/**
 * WordPress dependencies
 */
import { store as coreStore } from '@wordpress/core-data';
import { useSelect } from '@wordpress/data';

export default function usePost(postId, postType) {
	const { post, image, category, isLoading } = useSelect(
		(select) => {
			const { getEntityRecord, isResolving } = select(coreStore);
			const entityArgs = ['postType', postType, postId];
			const entity = getEntityRecord(...entityArgs);
			const _isLoading = isResolving('getEntityRecord', entityArgs) ?? true;
			const featuredImage = entity?.featured_media;

			return {
				isLoading: _isLoading,
				post: entity,
				image: featuredImage && getEntityRecord('root', 'media', featuredImage),
				category:
					entity?.type === 'post' && entity?.categories.length !== 0
						? getEntityRecord('taxonomy', 'category', entity?.categories[0])
						: '',
			};
		},
		[postId, postType],
	);

	return { post, image, category, isLoading };
};
