import { NgTemplateOutlet } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
	selector: 'app-example-menu',
	imports: [NgTemplateOutlet, RouterModule],
	template: `
		<nav class="flex-row flex-wrap gap-sm">
			<ng-container
				*ngTemplateOutlet="button; context: { text: 'Typographies', link: '/example/typographies' }"
			/>

			<ng-container
				*ngTemplateOutlet="button; context: { text: 'Colors', link: '/example/colors' }"
			/>

			<ng-container
				*ngTemplateOutlet="button; context: { text: 'Spacings', link: '/example/spacings' }"
			/>

			<ng-container
				*ngTemplateOutlet="
					button;
					context: { text: 'Border radius', link: '/example/border-radius' }
				"
			/>

			<ng-container
				*ngTemplateOutlet="button; context: { text: 'Shadows', link: '/example/shadows' }"
			/>

			<ng-container
				*ngTemplateOutlet="button; context: { text: 'Cards', link: '/example/cards' }"
			/>
		</nav>

		<ng-template #button let-text="text" let-link="link">
			<a
				class="btn round-sm p-xs px-sm"
				[class]="active.isActive ? 'weight-xxl surface-serene' : 'surface-vivid'"
				routerLinkActive
				#active="routerLinkActive"
				[routerLinkActiveOptions]="{ exact: true }"
				[routerLink]="link"
				>{{ text }}</a
			>
		</ng-template>
	`,
})
export default class ExampleMenuComponent {}
