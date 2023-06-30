import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import RegisterPage from './login.page';
import { LOGIN_ROUTES } from './login.routes';

@NgModule({
	imports: [CommonModule, RouterModule.forChild(LOGIN_ROUTES), ReactiveFormsModule],
	declarations: [RegisterPage],
	exports: [RegisterPage],
})
export default class LoginModule {}