export class GMRole {

	static hasArticleAccessRole(user): boolean {
		let roles = user.roles;

		if (roles.indexOf('admin') != -1 || roles.indexOf('manager') != -1 || roles.indexOf('editor') != -1) {
			return true;
		}
		return false;
	}

	static hasArticleRemoveRole(user, article): boolean {
		let roles = user.roles;

		if (roles.indexOf('admin') != -1 || roles.indexOf('manager') != -1) return true;
		if (roles.indexOf('editor') != -1 && user.username === article.account) return true;

		return false;
	}

}
