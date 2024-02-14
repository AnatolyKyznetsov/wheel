
const prizes = [
{
    name: 'Приз 1',
    text: 'lotem ipsum dolor sit amet',
    isPrize: true,
    id: 1,
},
{
    name: 'Пусто 1',
    text: 'lotem ipsum dolor sit amet',
    isPrize: false,
    id: 2,
},
{
    // name: 'lotem ipsum dolor sit amet lotem ipsum dolor sit amet',
    name: 'Приз 2',
    text: 'lotem ipsum dolor sit amet',
    isPrize: true,
    id: 3,
},
{
    name: 'Пусто 2',
    text: 'lotem ipsum dolor sit amet',
    isPrize: false,
    id: 4,
},
{
    name: 'Приз 3',
    text: 'lotem ipsum dolor sit amet',
    isPrize: true,
    id: 5,
},
{
    name: 'Пусто 3',
    text: 'lotem ipsum dolor sit amet',
    isPrize: false,
    id: 6,
},
{
    name: 'Приз 4',
    text: 'lotem ipsum dolor sit amet',
    isPrize: true,
    id: 7,
},
{
    name: 'Пусто 4',
    text: 'lotem ipsum dolor sit amet',
    isPrize: false,
    id: 8,
},
{
    name: 'Приз 5',
    text: 'lotem ipsum dolor sit amet',
    isPrize: true,
    id: 9,
},
{
    name: 'Пусто 5',
    text: 'lotem ipsum dolor sit amet',
    isPrize: false,
    id: 10,
},
{
    name: 'Приз 6',
    text: 'lotem ipsum dolor sit amet',
    isPrize: true,
    id: 11,
},
{
    name: 'Пусто 6',
    text: 'lotem ipsum dolor sit amet',
    isPrize: false,
    id: 12,
},
];

document.addEventListener('DOMContentLoaded', () => {
    const initWheel = () => {
        const wheel = document.querySelector('.js-wheel');
        const button = document.querySelector('.js-wheelStart');
        const triesBlock = document.querySelector('.js-tries');
        const audio = document.querySelector('.js-audio');
        const message = document.querySelector('.js-wheelText');

        if (!wheel || !prizes) {
            return false;
        }

        const list = wheel.querySelector('.js-wheelList');
        const pointer = wheel.querySelector('.js-wheelPointer');

        if (!list || !pointer) {
            return false;
        }

        if (prizes.length % 2 !== 0) {
            prizes.push({ name: '+1 Вращение', id: 'error' });
        }

        const sectors = 360 / prizes.length;
        const offset = Math.floor(180 / prizes.length);

        let pointerAnim = null;
        let items = null;
        let rotation = 0;
        let currentSector = 0;
        let tries = 3;
        let volume = .1;

        const setTries = () => {
            tries--;

            if (triesBlock) {
                triesBlock.textContent = tries;
            }
        }

        const selectPrize = () => {
            const index = Math.floor(rotation / sectors);
            items[index].classList.add('is-active');
            const target = prizes[index];

            if (target.isPrize) {
                (async () => {
                    await confetti('confetti', {
                        colors: ['#E9F931', '#087F41', '#68C2C6', '#68C2C6', '#16C067', '#EE6889', '#e4335f'],
                        count: 1000,
                    })
                })();
            }

            if (message) {
                // message.textContent = target.text;
            }            
        };

        const runPointerAnimation = () => {
            const style = window.getComputedStyle(list);

            const values = style.transform.split('(')[1].split(')')[0].split(',');
            const a = values[0];
            const b = values[1];
            let rad = Math.atan2(b, a);
        
            if (rad < 0) rad += (2 * Math.PI);
        
            const angle = Math.round(rad * (180 / Math.PI));
            const slice = Math.floor(angle / sectors);

            if (currentSector !== slice) {
                pointer.style.animation = 'none';
                setTimeout(() => pointer.style.animation = null, 10);
                currentSector = slice;
            }

            pointerAnim = requestAnimationFrame(runPointerAnimation);
        };

        const volumeFadeOut = () => {
            if (!audio) {
                return false;
            }

            const fadeOutInterval = setInterval(() => {
                volume -= .01;

                volume = Math.max(0, volume);
                volume = Math.min(1, volume);

                audio.volume = volume;

                if (volume === 0) {
                    clearInterval(fadeOutInterval);
                }
            }, 460);
        }

        const itemPosition = id => {
            const target = prizes.find(e => e.id == id);
            const min = Math.ceil(target.startPos);
            const max = Math.floor(target.endPos);
            const result = Math.floor(Math.random() * (max - min + 1)) + min;

            console.log(target);
            console.log(result);

            return result;
        }


        const setPosition = () => {
            const step = 360 / prizes.length;

            prizes.forEach((item, index) => {
                item.startPos = step * index;
                item.endPos = step * index + step - 1;
            });
        }

        button?.addEventListener('click', () => {
            setTries();

            if (audio) {
                audio.currentTime = 0;
                audio.volume = .1;
                audio.play();
            }

            let id = null;

            items.forEach(item => {
                item.classList.remove('is-active');
            });

            list.style.setProperty('--rotate', 0);
            button.disabled = true;
            runPointerAnimation();

            rotation = 360;
            wheel.classList.add('is-active');
            list.style.setProperty('--rotate', rotation);

            pointer.style.animation = 'none';

            const int = setInterval(() => {
                if (id) {
                    console.log('tak');

                    volumeFadeOut();
                    clearInterval(int);
                    rotation += 360 + itemPosition(id);
                    wheel.classList.add('is-stoping');
                    list.style.setProperty('--rotate', rotation);
                } else {
                    console.log('tik');

                    wheel.classList.remove('is-active');
                    wheel.classList.add('is-active');
                    rotation += 360;
                    list.style.setProperty('--rotate', rotation);
                }
            }, 1900); // меньше transition whell.is-active
            
            // запрос
            setTimeout(() => {
                id = 1;
                // id = Math.floor(Math.random() * prizes.length) + 1;
                console.log(id);
            }, 2000);
        });

        list.addEventListener('transitionend', () => {
            if (tries > 0) {
                button.disabled = false;
            }
            cancelAnimationFrame(pointerAnim);

            list.style.removeProperty('transition', '');
            
            wheel.classList.remove('is-active');
            wheel.classList.remove('is-stoping');

            rotation %= 360;
            list.style.setProperty('--rotate', rotation);

            selectPrize();

            if (audio) {
                audio.pause();
            }
        });

        prizes.forEach(({ name }, index) => {
            const rotation = ((sectors * index) * -1) - offset;

            list.insertAdjacentHTML('beforeend', `<li class="wheel__item js-wheelItem" style="--rotate: ${rotation}deg"><span>${name}</span></li>`);
        });

        list.setAttribute('style',
            `background: conic-gradient(
            from -90deg, ${prizes.map((item, i) => `${i % 2 === 0 ? '#2569C3' : '#25a9c3'} 0 ${(100 / prizes.length) * (prizes.length - i)}%`).reverse()});`
        );

        items = list.querySelectorAll('.js-wheelItem');

        setPosition();
    }

    initWheel();
});
