export function showAlert(message: string): void {
	alert(message);
}

export function isConfirmAlertAccepted(message: string): boolean {
	return window.confirm(message);
}
