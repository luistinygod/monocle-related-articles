/**
 * WordPress dependencies
 */
import { Spinner } from '@wordpress/components';
import { RawHTML } from '@wordpress/element';
import { useSelect } from '@wordpress/data';
import { useEntityProp } from '@wordpress/core-data';

/**
 * Internal dependencies
 */
import usePost from './use-post';

export default function RelatedArticlesPost({ id }) {
	const { post, image } = usePost(id, 'post');
	const title = post?.title?.raw || '';

	if (!post) {
		return (
			<li>
				<Spinner />
			</li>
		);
	}

	return (
		<li>
			<div className="item">
				<div className="item__image">{!!image && <img src={image.source_url} alt={image.alt_text} />}</div>
				<div className="item__content">
					<p className="item__title">{title}</p>
					<div className="item__excerpt">
						<RawHTML>{post.excerpt.rendered}</RawHTML>
					</div>
				</div>
			</div>
		</li>
	);
}
