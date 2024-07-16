# AngularElementsProject

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 17.3.8.

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The application will automatically reload if you change any of the source files.

## Passos para configurar um projeto para exportar Web Components
1) Criar a aplicação Angular com o uso de um módulo:
```typescript
npx @angular/cli@17 new angular-elements-project --no-standalone
```

2) Alterar o builder no `angular.json`:
```diff
- "builder": "@angular-devkit/build-angular:application",
+ "builder": "@angular-devkit/build-angular:browser-esbuild",
```

3) Alterar a linha `browser`` no `angular.json`:
```diff
-"browser": "src/main.ts",
+"main": "src/main.ts",
```

4) Instalar o pacote `@angular/elements`:
```typescript
npm i @angular/elements@17
```

5) Criar um componente utilizando `ViewEncapsulation.ShadowDom` no modo de encapsulamento:
```typescript
@Component({
  selector: 'app-example',
  template: `...`,
  styles: [...],
  encapsulation: ViewEncapsulation.ShadowDom
})
export class ToggleComponent {...}
```

6) Registrar seus componentes como `CustomElement` no arquivo `main.ts`:
```typescript
import { createCustomElement } from '@angular/elements';
import { createApplication } from '@angular/platform-browser';
import { ToggleComponent } from './app/toggle/toggle.component';

(async () => {

  const app = await createApplication({
    providers: [...],
  });

  const toogleElement = createCustomElement(ToggleComponent, {
    injector: app.injector,
  });

  customElements.define('my-component', toogleElement);

})();
```

## OBS:
Importante ressaltar que o nome do `CustomElement` deve ser diferente do nome definido no seletor do componente:
```typescript
@Component({
  selector: 'app-example',
  template: `...`,
  styles: [...],
  encapsulation: ViewEncapsulation.ShadowDom
})
export class ToggleComponent {...}
```

Logo, não podemos registrar o `CustomElement` com o nome `app-example`.

7) Depois de finalizar o componente, precisamos fazer o build para ter acesso aos arquivos do bundle. Passamos a opção `--output-hashing none` para que os nomes dos arquivos sejam mais simples.
```typescript
ng build --output-hashing none
```

## Como consumir os Web Components em uma aplicação AngularJS

1) Após feito o build, precisamos dos arquivos `polyfills.js`, `main.js` e `styles.css` que foram gerados na pasta `dist` do projeto Angular 17. Esses arquivos devem ser linkados no `index.html` do projeto AngularJS.

2) Durante o desenvolvimento temos duas opções: servir a aplicação Angular 17 (`ng serve`) e linkar os arquivos do bundle usando `localhost:4200/[nome-do-arquivo]`, ou manualmente movê-los para a pasta do projeto AngularJS e linká-los localmente. Em produção ainda deve ser definida uma estratégia.

    2.1) Independentemente da estratégia, no `index.html` do projeto AngularJS, devemos linkar os arquivos do bundle nessa ordem especificamente (o exemplo abaixo linka diretamente da aplicação sendo servida):
```html
    <script src="http://localhost:4200/polyfills.js" type="module"></script>
    <script src="http://localhost:4200/main.js" type="module"></script>
    <link href="http://localhost:4200/styles.css" rel="stylesheet"> <!-- caso exista um arquivo de estilo global -->
```

### OBS: Os arquivos JS precisam ser linkados com `type="module"`.

3) Feito isso, é necessário chamar, no template do seu componente AngularJS, a tag que foi definida no passo 6:
```javascript
angular.module('myApp')
.component('homeComponent', {
    template: `<my-component></my-component>`
});

```

4) Para conseguir escutar eventos emitidos por esse componente (que foi disparado por meio de um `EventEmitter`), devemos buscá-lo no DOM e adicionar um `eventListener` passando como nome do evento justamente o nome da variável do `EventEmitter` que foi definido no componente Angular 17:
```typescript
  export class MyComponent {

    @Input() active = false;
    @Input() title = '';
    @Output() change = new EventEmitter<boolean>(); // `change` será o nome do CustomEvent;

    toggle(): void {
      this.active = !this.active;
      this.change.emit(this.active); // Aqui está sendo emitido um valor, logo, disparado um CustomEvent com nome `change`;
    }

  }
```
```javascript
  angular.module('myApp')
    .component('homeComponent', {
        template: `<my-component></my-component>`,
        controller: () => {
            const el = document.querySelector('my-component');
            el.addEventListener('change', (event) => alert(event.detail)); // Escutamos o evento `change`, como definido no componente Angular acima. Importante ressaltar que o valor passado sempre estará disponível no objeto `detail`.
        }
    });
```