import { IonButton, IonButtons, IonContent, IonHeader, IonItem, IonLabel, IonList, IonSelect, IonSelectOption, IonTitle, IonToolbar } from '@ionic/react';
import React, { useEffect, useState } from 'react';
import { Collection } from '../../api/marketplace/Collection';
import { MarketplaceService } from '../../services/MarketplaceService';
import './FilterModal.css';

interface ContainerProps {
  onDismiss: () => void,
  onApply: (val: FilterData) => void,
  value: FilterData | undefined,
  hasAllCategoriesOption?: boolean,
  hiddenCategories?: Array<string>,
}

interface Category {
  name: string,
  value: string,
  children?: Array<Category>,
}

export interface FilterData {
  category: string,
  subCategory?: string,
  subCategory2?: string,
  rarity: Array<string>,
  gender: string,
  network: string,
  collection: string
}

const FilterModal: React.FC<ContainerProps> = ({ value, onDismiss, onApply, hasAllCategoriesOption, hiddenCategories }) => {

  const [changed, setChanged] = useState(false);
  const [categories, setCategories] = useState<Array<Category>>([]);
  const [category, setCategory] = useState<Category>();
  const [subCategory, setSubCategory] = useState<Category>();
  const [subCategory2, setSubCategory2] = useState<Category>();
  const [rarity, setRarity] = useState<Array<string>>([]);
  const [gender, setGender] = useState("all");
  const [network, setNetwork] = useState("all");
  const [collections, setCollections] = useState<Array<Collection>>([]);
  const [collection, setCollection] = useState("all");

  useEffect(() => {
    const prepareCategories = () => {
      let categories: Array<Category> = [
        {
          name: "All",
          value: "all"
        },
        {
          name: "Wearables",
          value: "wearables",
          children: [
            { name: "All", value: "all" },
            {
              name: "Head",
              value: "head",
              children: [
                { name: "All", value: "all" },
                { name: "Facial Hair", value: "facial_hair" },
                { name: "Hair", value: "hair" },
                { name: "Eyes", value: "eyes" },
                { name: "Eyebrows", value: "eyebrows" },
                { name: "Mouth", value: "mouth" },
              ]
            },
            { name: "Upper Body", value: "upper_body" },
            { name: "Lower Body", value: "lower_body" },
            { name: "Feet", value: "feet" },
            {
              name: "Accessories", value: "accessories",
              children: [
                { name: "All", value: "all" },
                { name: "Earring", value: "earring" },
                { name: "Eyewear", value: "eyewear" },
                { name: "Hat", value: "hat" },
                { name: "Helmet", value: "helmet" },
                { name: "Mask", value: "mask" },
                { name: "Tiara", value: "tiara" },
                { name: "Top Head", value: "top_head" },
              ],
            },
            { name: "Skins", value: "skins" },
          ]
        },
        {
          name: "Emotes",
          value: "emotes",
          children: [
            { name: "All", value: "all" },
            { name: "Dance", value: "dance" },
            { name: "Poses", value: "poses" },
            { name: "Fun", value: "fun" },
            { name: "Greetings", value: "greetings" },
            { name: "Horror", value: "horror" },
            { name: "Miscellaneous", value: "miscellaneous" },
            { name: "Stunt", value: "stunt" },
            { name: "Reactions", value: "reactions" },
          ]
        },
        { name: "Land", value: "land" },
        { name: "Names", value: "names" }
      ];

      if (!hasAllCategoriesOption) {
        categories.splice(0, 1);
      }
      if (hiddenCategories && hiddenCategories.length > 0) {
        categories = categories.filter(c => hiddenCategories.indexOf(c.value) < 0);
      }

      return categories;
    }

    setCategories(prepareCategories());
    setCategory(categories[0]);

    const setInitials = () => {
      if (value !== undefined) {
        const mainCategory = categories.find(c => c.value === value.category);
        if (mainCategory) {
          setCategory(mainCategory);
        }
        if (mainCategory?.children) {
          const selectedSubCategory = mainCategory?.children.find(c => c.value === value.subCategory);
          if (selectedSubCategory) {
            setSubCategory(selectedSubCategory);
          }
          if (selectedSubCategory?.children) {
            const selectedSubCategory2 = selectedSubCategory?.children.find(c => c.value === value.subCategory2);
            if (selectedSubCategory2) {
              setSubCategory2(selectedSubCategory2);
            }
          }
        }
        setRarity(value.rarity);
        setGender(value.gender);
        setCollection(value.collection);
        setNetwork(value.network);
      }
      else {
        setCategory(categories[0])
        if (categories[0].children) {
          setSubCategory(categories[0].children[0]);
          if (categories[0].children[0].children) {
            setSubCategory2(categories[0].children[0].children[0]);
          }
        }
      }
    }

    const getCollections = async () => {
      try {
        const marketplaceService = new MarketplaceService();
        const data = await marketplaceService.getCollections();
        setCollections(data);
      }
      finally {
        if (value) {
          setTimeout(() => {
            setCollection("");
            setCollection(value.collection);
          }, 500);
        }
      }
    }

    setInitials();
    getCollections()
  }, [value, hasAllCategoriesOption, hiddenCategories]);

  useEffect(() => {
    setChanged(true);
  }, [category, rarity, gender, network, collection]);

  const compareCategories = (c1: Category, c2: Category): boolean => {
    return c1 && c2 && c1.value === c2.value;
  }

  const handleCategorySelected = (e: any) => {
    const selectedCategory = e.detail.value as Category;
    setCategory(selectedCategory);
    if (selectedCategory.children) {
      setSubCategory(selectedCategory.children[0])
    }
  }

  const handleSubCategorySelected = (e: any) => {
    const selectedCategory = e.detail.value as Category;
    setSubCategory(selectedCategory);
    if (selectedCategory.children) {
      setSubCategory2(selectedCategory.children[0])
    }
  }

  const handleApplyClicked = () => {
    if (category) {
      const filterData: FilterData = {
        category: category.value,
        subCategory: subCategory?.value,
        subCategory2: subCategory2?.value,
        rarity: rarity,
        gender: gender,
        network: network,
        collection: collection
      }
      onApply(filterData);
    }
  }

  return (
    <>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="end">
            {!changed &&
              <IonButton onClick={() => onDismiss()}>Close</IonButton>
            }
            {changed &&
              <IonButton color="primary" onClick={handleApplyClicked}>Apply</IonButton>
            }
          </IonButtons>
          <IonTitle>Filter</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="filter-modal">
        {category &&
          <IonList>
            <IonItem>
              <IonLabel>Category</IonLabel>
              <IonSelect compareWith={compareCategories} value={category} onIonChange={handleCategorySelected}>
                {categories.map((c, index) =>
                  <IonSelectOption key={index} value={c}>{c.name}</IonSelectOption>
                )}
              </IonSelect>
            </IonItem>
            {category.children && category.children.length > 0 &&
              <IonItem>
                <IonLabel></IonLabel>
                <IonSelect compareWith={compareCategories} value={subCategory} onIonChange={handleSubCategorySelected}>
                  {category.children.map((c, index) =>
                    <IonSelectOption key={index} value={c}>{c.name}</IonSelectOption>
                  )}
                </IonSelect>
              </IonItem>
            }
            {subCategory && subCategory.children && subCategory.children.length > 0 &&
              <IonItem>
                <IonLabel></IonLabel>
                <IonSelect compareWith={compareCategories} value={subCategory2} onIonChange={e => setSubCategory2(e.detail.value)}>
                  {subCategory.children.map((c, index) =>
                    <IonSelectOption key={index} value={c}>{c.name}</IonSelectOption>
                  )}
                </IonSelect>
              </IonItem>
            }
            {category.value === "wearables" &&
              <>
                <IonItem>
                  <IonLabel>Rarity</IonLabel>
                  <IonSelect value={rarity} onIonChange={e => setRarity(e.detail.value)} multiple={true} placeholder={"All"}>
                    <IonSelectOption value="common">Common</IonSelectOption>
                    <IonSelectOption value="uncommon">Uncommon</IonSelectOption>
                    <IonSelectOption value="rare">Rare</IonSelectOption>
                    <IonSelectOption value="epic">Epic</IonSelectOption>
                    <IonSelectOption value="legendary">Legendary</IonSelectOption>
                    <IonSelectOption value="mythic">Mythic</IonSelectOption>
                    <IonSelectOption value="unique">Unique</IonSelectOption>
                  </IonSelect>
                </IonItem>
                <IonItem>
                  <IonLabel>Gender</IonLabel>
                  <IonSelect value={gender} onIonChange={e => setGender(e.detail.value)} placeholder={"All"}>
                    <IonSelectOption value="all">All</IonSelectOption>
                    <IonSelectOption value="male">Male</IonSelectOption>
                    <IonSelectOption value="female">Female</IonSelectOption>
                  </IonSelect>
                </IonItem>
                <IonItem>
                  <IonLabel>Collection</IonLabel>
                  <IonSelect value={collection} onIonChange={e => setCollection(e.detail.value)}>
                    <IonSelectOption value="all">All</IonSelectOption>
                    {collections.map((c, index) =>
                      <IonSelectOption key={index} value={c.address}>{c.name}</IonSelectOption>
                    )}
                  </IonSelect>
                </IonItem>
                <IonItem>
                  <IonLabel>Network</IonLabel>
                  <IonSelect value={network} onIonChange={e => setNetwork(e.detail.value)}>
                    <IonSelectOption value="all">All</IonSelectOption>
                    <IonSelectOption value="ETHEREUM">Ethereum</IonSelectOption>
                    <IonSelectOption value="MATIC">Polygon</IonSelectOption>
                  </IonSelect>
                </IonItem>
              </>
            }
          </IonList>
        }
      </IonContent>
    </>
  );
};

export default FilterModal;
