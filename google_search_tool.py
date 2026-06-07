"""
Simple Google Search Tool
Searches for names on Google Search and returns results
"""

import requests
from bs4 import BeautifulSoup
import urllib.parse
from typing import List, Dict


class GoogleSearchTool:
    """A simple tool to search names on Google Search"""
    
    def __init__(self):
        self.base_url = "https://www.google.com/search"
        self.headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
    
    def search(self, name: str, num_results: int = 5) -> List[Dict]:
        """
        Search for a name on Google Search
        
        Args:
            name (str): The name to search for
            num_results (int): Number of results to return (default: 5)
        
        Returns:
            List[Dict]: List of search results with title, URL, and snippet
        """
        try:
            params = {
                'q': name,
                'num': num_results
            }
            
            response = requests.get(self.base_url, params=params, headers=self.headers, timeout=10)
            response.raise_for_status()
            
            soup = BeautifulSoup(response.content, 'html.parser')
            results = []
            
            # Parse search results
            search_results = soup.find_all('div', class_='g', limit=num_results)
            
            for result in search_results:
                try:
                    # Extract title and link
                    link_elem = result.find('a', href=True)
                    title_elem = result.find('h3')
                    snippet_elem = result.find('span', class_='VwiC3b')
                    
                    if link_elem and title_elem:
                        title = title_elem.get_text()
                        url = link_elem['href']
                        snippet = snippet_elem.get_text() if snippet_elem else "No snippet available"
                        
                        results.append({
                            'title': title,
                            'url': url,
                            'snippet': snippet
                        })
                except Exception as e:
                    continue
            
            return results
        
        except requests.RequestException as e:
            print(f"Error making request: {e}")
            return []
        except Exception as e:
            print(f"Error parsing results: {e}")
            return []
    
    def search_multiple(self, names: List[str], num_results: int = 5) -> Dict[str, List[Dict]]:
        """
        Search for multiple names
        
        Args:
            names (List[str]): List of names to search for
            num_results (int): Number of results per search
        
        Returns:
            Dict[str, List[Dict]]: Dictionary with names as keys and results as values
        """
        all_results = {}
        for name in names:
            all_results[name] = self.search(name, num_results)
        return all_results


def main():
    """Example usage of the GoogleSearchTool"""
    tool = GoogleSearchTool()
    
    # Example: Search for a single name
    print("Searching for 'Albert Einstein'...\n")
    results = tool.search("Albert Einstein", num_results=3)
    
    for i, result in enumerate(results, 1):
        print(f"Result {i}:")
        print(f"  Title: {result['title']}")
        print(f"  URL: {result['url']}")
        print(f"  Snippet: {result['snippet']}\n")
    
    # Example: Search for multiple names
    print("\n" + "="*50)
    print("Searching for multiple names...\n")
    names = ["Marie Curie", "Isaac Newton"]
    multiple_results = tool.search_multiple(names, num_results=2)
    
    for name, results in multiple_results.items():
        print(f"\nResults for '{name}':")
        for i, result in enumerate(results, 1):
            print(f"  {i}. {result['title']}")
            print(f"     {result['url']}\n")


if __name__ == "__main__":
    main()
