document.addEventListener('DOMContentLoaded', () => {
    const initWheel = () => {
        const data = window.data;
        const wheel = document.querySelector('.js-wheel');
        const button = document.querySelector('.js-wheelStart');
        const triesBlock = document.querySelector('.js-tries');
        const audio = document.querySelector('.js-audio');
        const message = document.querySelector('.js-wheelText');
        const popup = document.querySelector('.js-wheelPopuap');
        const popupOpeners = document.querySelectorAll('.js-wheelPopuapOpen');

        if (!wheel || !data) {
            return false;
        }

        const prizes = data['PRIZES'];

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
        const styleVars = window.getComputedStyle(popup);
        const sectorsColors = [
            styleVars.getPropertyValue('--sector-odd') || '#2569C3',
            styleVars.getPropertyValue('--sector-even') || '#25A9C3',
        ];

        let pointerAnim = null;
        let items = null;
        let rotation = 0;
        let currentSector = 0;
        let tries = data['TRIES'];

        const setTries = (setStart) => {
            if (!setStart) {
                tries--;
            }

            if (triesBlock) {
                triesBlock.textContent = tries;
            }

            if (tries == 0) {
                button.disabled = true;
            }
        }

        const showPopup = () => {
            if (!popup) {
                return false;
            }

            popup.classList.add('is-active');

            setTimeout(() => {
                popup.classList.add('is-visible');
            }, 100);

            if (data['LAST_PIRIZE_ID']) {
                const id = data['LAST_PIRIZE_ID'];
                const position = itemPosition(id);
                const lastPrize = data['PRIZES'].find(e => e.id = id);

                list.style.setProperty('--rotate', position);

                if (message && lastPrize) {
                    message.textContent = lastPrize.text;
                }
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
                message.textContent = target.text;
            }
            
            data['LAST_PIRIZE_ID'] = target.id;
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

            let volume = .1;

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

            return result;
        }

        const setPosition = () => {
            const step = 360 / prizes.length;

            prizes.forEach((item, index) => {
                item.startPos = step * index + 1;
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
                    volumeFadeOut();
                    clearInterval(int);
                    rotation += 360 + itemPosition(id);
                    wheel.classList.add('is-stoping');
                    list.style.setProperty('--rotate', rotation);
                } else {
                    wheel.classList.remove('is-active');
                    wheel.classList.add('is-active');
                    rotation += 360;
                    list.style.setProperty('--rotate', rotation);
                }
            }, 1900); // меньше transition whell.is-active
            
            // запрос
            setTimeout(() => {
                id = Math.floor(Math.random() * prizes.length) + 1;
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

        popup?.addEventListener('click', e => {
            if (e.target.classList.contains('js-wheelPopuap') || 
                e.target.classList.contains('js-wheelPopuapClose')) {
                    popup.classList.remove('is-visible');
                    
                    setTimeout(() => {
                        popup.classList.remove('is-active');
                    }, 200);
                }
        });

        popupOpeners.forEach(opener => {
            opener.addEventListener('click', showPopup);
        });

        prizes.forEach(({ name }, index) => {
            const rotation = ((sectors * index) * -1) - offset;

            list.insertAdjacentHTML('beforeend', `<li class="wheel__item js-wheelItem" style="--rotate: ${rotation}deg"><span>${name}</span></li>`);
        });

        list.setAttribute('style',
            `background: conic-gradient(
            from -90deg, ${prizes.map((item, i) => `${i % 2 === 0 ? sectorsColors[0] : sectorsColors[1]} 0 ${(100 / prizes.length) * (prizes.length - i)}%`).reverse()});`
        );

        items = list.querySelectorAll('.js-wheelItem');

        setPosition();
        setTries(true);

        setTimeout(() => {
            showPopup();
        }, 1000);
    }

    initWheel();
});
