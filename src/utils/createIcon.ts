export const createIcon = (container: HTMLElement, iconName) => {
    const icon = document.createElement('i')
    icon.classList.add('fas', `fa-${iconName}`)
    container.appendChild(icon)
}