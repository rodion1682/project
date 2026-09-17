<script></script>

<template>
  <section class="how-section">
    <div class="how-section__heading">
      <h2 class="how-section__title">
        {{ $t('How buying works') }}
      </h2>

      <div class="how-section__line"></div>
    </div>

    <div class="how-section__items">
      <div class="how-section__item">
        <div class="how-section__number">
          {{ $t('01 / 03') }}
        </div>

        <h3 class="how-section__item-title">
          {{ $t('Choose a title') }}
        </h3>

        <p class="how-section__text">
          {{ $t('Filter by launcher, genre or discount, then send it to the cart.') }}
        </p>
      </div>

      <div class="how-section__item">
        <div class="how-section__number">
          {{ $t('02 / 03') }}
        </div>

        <h3 class="how-section__item-title">
          {{ $t('Pay from your balance') }}
        </h3>

        <p class="how-section__text">
          {{ $t('Load it once by card or gift card, then every later order takes two clicks.') }}
        </p>
      </div>

      <div class="how-section__item">
        <div class="how-section__number">
          {{ $t('03 / 03') }}
        </div>

        <h3 class="how-section__item-title">
          {{ $t('Activate and play') }}
        </h3>

        <p class="how-section__text">
          {{
            $t('Take the code from the order page or your inbox and paste it into the launcher.')
          }}
        </p>
      </div>
    </div>
  </section>
</template>

<style scoped lang="scss">
@use '@/assets/styles/mixins' as *;
@use '@/assets/styles/media' as *;
@use '@/assets/styles/classes' as *;

.how-section {
  width: 100%;
  min-width: 0;
  @include adaptiveValue('padding-top', 96, 36);
  &__container {
    width: 100%;
    min-width: 0;
  }

  &__heading {
    width: 100%;
    min-width: 0;

    display: flex;
    align-items: baseline;

    gap: 28px;

    margin-bottom: 36px;
  }

  &__title {
    flex: 0 0 auto;

    margin: 0;

    color: var(--primary-color);

    font-family: var(--font-gabarito);
    font-size: 48px;
    font-weight: 900;
    line-height: 1.1;
    letter-spacing: -0.03em;
  }

  &__line {
    width: 100%;
    min-width: 40px;
    height: 1px;

    flex: 1 1 0;

    background: linear-gradient(90deg, rgba(204, 220, 236, 1) 0%, rgba(204, 220, 236, 0) 100%);
  }

  &__items {
    width: 100%;
    min-width: 0;

    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));

    gap: 24px;
  }

  &__item {
    min-width: 0;

    display: flex;
    flex-direction: column;

    gap: 14px;

    padding: 34px 36px 38px;

    border: 2px solid var(--border-primary-color);
    border-radius: 14px;

    background-color: var(--bg-secondary-color);
  }

  &__number {
    color: var(--hint-primary-color);

    font-size: 12px;
    font-weight: 400;
    line-height: 1.4;
    letter-spacing: 0.16em;

    font-variant-numeric: tabular-nums;
  }

  &__item-title {
    margin: 0;

    color: var(--primary-color);

    font-family: var(--font-gabarito);
    font-size: 26px;
    font-weight: 900;
    line-height: 1.2;
    letter-spacing: -0.01em;
  }

  &__text {
    margin: 0;

    color: var(--seconday-color);

    font-size: 15px;
    font-weight: 400;
    line-height: 1.75;

    text-wrap: pretty;
  }

  @media (max-width: $md3) {
    padding-top: 64px;
    padding-bottom: 64px;

    &__title {
      font-size: 38px;
    }

    &__items {
      gap: 16px;
    }

    &__item {
      padding: 26px 24px 28px;
    }

    &__item-title {
      font-size: 22px;
    }
  }

  @media (max-width: $md5) {
    padding-top: 32px;
    padding-bottom: 32px;

    &__heading {
      display: block;

      margin-bottom: 14px;
    }

    &__title {
      font-family: inherit;
      font-size: 22px;
      font-weight: 500;
      line-height: 1.2;
      letter-spacing: -0.03em;
    }

    &__line {
      display: none;
    }

    &__items {
      display: flex;
      flex-direction: column;

      gap: 14px;
    }

    &__item {
      gap: 8px;

      padding: 18px 20px;

      border-radius: 14px;
    }

    &__number {
      font-size: 10px;
      line-height: 1.4;
      letter-spacing: 0.16em;
    }

    &__item-title {
      font-family: inherit;
      font-size: 17px;
      font-weight: 500;
      line-height: 1.3;
      letter-spacing: 0;
    }

    &__text {
      font-size: 13px;
      line-height: 1.65;
    }
  }
}
</style>
