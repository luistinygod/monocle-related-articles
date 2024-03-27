<?php

declare( strict_types = 1 );
namespace Monocle\BlockLibrary\RelatedArticles;

function get_related_query( string $fallback = '', array $posts = [], int $current_post_id = 0 ): array {
	if ( empty( $fallback ) ) {
		// This indicates sone hand-picked items.
		$query_args = [
			'post_type' => [],
			'post__in'  => [],
			'orderby'   => 'post__in',
		];

		foreach ( $posts as $post_id ) {
			$post = \get_post( $post_id );
			if ( ! in_array( $post->post_type, $query_args['post_type'], true ) ) {
				$query_args['post_type'][] = $post->post_type;
			}

			$query_args['post__in'][] = (int) $post_id;
		}

		return $query_args;
	}

	// If we got here, it means there is a fallback set.
	if ( empty( $current_post_id ) ) {
		// Fail-fast, the fallback only works for single posts.
		return [];
	}

	$query_args = [
		'post_type' => \get_post_type( $current_post_id ),
	];

	switch ( $fallback ) {
		case 'post_type':
			break;

		case 'category':
			$categories = \wp_get_post_categories( $current_post_id, [ 'fields' => 'ids' ] );
			if ( ! empty( $categories ) && ! \is_wp_error( $categories ) ) {
				$query_args = [
					'tax_query' => [
						'relation' => 'AND',
						[
							'taxonomy' => 'category',
							'field'    => 'term_id',
							'terms'    => $categories,
							'operator' => 'IN',
						],
					],
				];
			}
			break;

		case 'post_tag':
		default:
			$tags = \wp_get_post_tags( $current_post_id, [ 'fields' => 'ids' ] );
			if ( ! empty( $tags ) && ! \is_wp_error( $tags ) ) {
				$query_args = [
					'tax_query' => [
						'relation' => 'AND',
						[
							'taxonomy' => 'post_tag',
							'field'    => 'term_id',
							'terms'    => $tags,
							'operator' => 'IN',
						],
					],
				];
			}
			break;
	}

	if ( ! empty( $query_args ) ) {
		$query_args = array_merge( $query_args, [
			'post_status'         => 'publish',
			'ignore_sticky_posts' => 1,
			'orderby'             => 'publish_date',
			'order'               => 'DESC',
			'posts_per_page'      => 4,
		] );
	}

	return $query_args;
}
