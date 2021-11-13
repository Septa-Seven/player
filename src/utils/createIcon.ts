export const createIcon = (container: HTMLElement, iconName) => {
    const icon = document.createElement('i')
    icon.classList.add(iconName)
    console.log(icon)
    container.appendChild(icon)
}