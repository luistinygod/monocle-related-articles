<?php
declare( strict_types = 1 );
namespace Monocle\BlockLibrary\RelatedArticles;
use function Monocle\BlockLibrary\RelatedArticles\get_related_query;

if ( ! defined( 'ABSPATH' ) ) {
	die();
}

error_log( '$attributes' . print_r($attributes , true ) ); //DEV_ONLY

if ( empty( $attributes['posts'] ) && empty( $attributes['fallback'] ) ) {
	// Not configured, nothing to display.
	return '';
}

$post_id = \intval( $block->context['postId'] ?? 0 ) ?: \get_the_ID();

$query_args = get_related_query(
	$attributes['fallback'] ?? '',
	$attributes['posts'] ?? [],
	$post_id ?: 0
);

if ( empty( $query_args ) ) {
	// Fail-fast, this is not a valid query.
	return '';
}

$output    = '';
$counter   = 0;
$the_query = new \WP_Query( $query_args );
if ( $the_query->have_posts() ) {
	while ( $the_query->have_posts() && $counter < 3 ) {
		$the_query->the_post();

		if ( $post_id === \get_the_ID() ) {
			// Skip the current post.
			continue;
		}

		\ob_start();
		?>
		<li>
			<div class="item">
				<?php if ( has_post_thumbnail() ) { ?>
					<div class="item__image">
						<?php the_post_thumbnail(); ?>
					</div>
				<?php } ?>
				<div class="item__content">
					<p class="item__title">
						<a href="<?php echo \esc_url( \get_permalink() ); ?>">
							<?php the_title(); ?>
						</a>
					</p>
					<?php
					if ( \has_excerpt() ) { ?>
						<div class="item__excerpt">
							<?php \the_excerpt(); ?>
						</div>
					<?php } ?>
				</div>
			</div>
		</li>
		<?php
		$output .= \ob_get_clean();

		++$counter;
	}

	if ( ! empty( $output ) ) {
		$output = '<ul class="monocle-related-articles__list has-' . (int) $counter . '-items">' . $output . '</ul>';
	}
}
// Restore original Post Data
\wp_reset_postdata();

if ( empty( $output ) ) {
	// No list of posts to display.
	return '';
}

$wrapper_attributes = \get_block_wrapper_attributes( [
	'class' => 'monocle-related-articles content-section alignfull',
] );

printf( '
	<div %s>
		<div class="monocle-related-articles__inside">
			%s
		</div>
	</div>',
	$wrapper_attributes,
	$output
);
